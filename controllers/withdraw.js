'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Withdraw = require('../models/withdraw');
const service = require('../services');
const moment = require('moment');
const Ticker = require('../models/ticker');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');
const bitcoin = require('bitcoin');

var sendpulse = require("sendpulse-api");
var sendpulse = require("../models/sendpulse.js");

var API_USER_ID= 'e0690653db25307c9e049d9eb26e6365';
var API_SECRET= '3d7ebbb8a236cce656f8042248fc536e';
var TOKEN_STORAGE="/tmp/"
var config = require('../config');
sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);

const STCclient = new bitcoin.Client({
	host: config.BBL.host,
	port: config.BBL.port,
	user: config.BBL.user,
	pass: config.BBL.pass,
	timeout: config.BBL.timeout
});

const BTCclient = new bitcoin.Client({
	host: config.BTC.host,
	port: config.BTC.port,
	user: config.BTC.user,
	pass: config.BTC.pass,
	timeout: config.BTC.timeout
});




function Index(req,res){
	res.locals.title = 'Withdraw'
	res.locals.menu = 'withdrawal'
	res.locals.user = req.user
	res.render('account/withdraw');
}
function WithdrawSubmit(req, res){
	var amountUsd = parseFloat(req.body.amount);
	console.log(req.body);
	if(!amountUsd)
		return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance'});
	
	var type = req.body.type;
	var wallet = req.body.wallet;
	
	var user = req.user;
	let newWithdraw = new Withdraw();

	!user.validPassword(_.trim(req.body.password))
	if (!user.validPassword(_.trim(req.body.password)) )
		return res.status(404).send({error: 'password', message: 'Wrong Password!'});
	
	if (type == 'btc' || type == 'coin' && wallet != '' && !isNaN(amountUsd)) {

			// type = Coin
			var ast_balance = parseFloat(user.balance.coin_wallet.available);

			if (parseFloat(ast_balance) < parseFloat(amountUsd) || parseFloat(amountUsd) <= 5) {
				return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance!'});
			}else{

				STCclient.validateAddress(wallet, function (err, valid) {
					if(err){
						return res.status(404).send('Error Validate Address!');
					}else{
						if (valid.isvalid) {
							Ticker.findOne({},(err,data_ticker)=>{
								if (err) {
									return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance!'});
								}else{
									var ast_usd = parseFloat(data_ticker.price_usd);
								
									var ast_withdraw_usd = (parseFloat(amountUsd)*parseFloat(ast_usd)).toFixed(8);
										ast_withdraw_usd = parseFloat(ast_withdraw_usd);
										console.log(ast_balance);
										console.log(amountUsd);
									var new_ast_balance = parseFloat(ast_balance - amountUsd).toFixed(8);
									var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
									var today = moment();
									newWithdraw.active_email = 0;
									newWithdraw.amount = amountUsd;
									newWithdraw.amount_usd =parseFloat(ast_withdraw_usd);
									newWithdraw.user_id = user._id;
									newWithdraw.status = 'pending';
									newWithdraw.username = user.displayName;
									newWithdraw.wallet = wallet;
									newWithdraw.txid = '';
									newWithdraw.fee = '0';
									newWithdraw.date = moment(today).format();
									newWithdraw.type = 'SFCC';
									newWithdraw.token_withdraw = token_withdraw;
									newWithdraw.rate = ast_usd;
									newWithdraw.save((err, WithdrawStored)=>{
										if(err){
											res.status(500).send({message: `Error Withdraw`})	
										}else{
											var query = {_id:user._id};
											var data_update = {
												$set : {
													'balance.coin_wallet.available': parseFloat(new_ast_balance)
												},
												$push: {
													'balance.coin_wallet.history': {
														date: Date.now(), 
														type: 'sent', 
														amount: amountUsd, 
														detail: 'Withdraw ' +parseFloat(amountUsd) + ' SFCC ($ '+ast_withdraw_usd+') from SFCC wallet <br> Exchange rate: 1 SFCC = '+parseFloat(ast_usd)+' USD'
													}
												}
											};
											User.update(query, data_update, function(err, UsersUpdate){
												if(err) res.status(500).send({message: `Error`})

												mailConfirmWithdraw(token_withdraw, amountUsd, wallet, user, WithdrawStored, function(data){
												
													return res.status(200).send({error: '', status: 1, message: 'Withdraw success'});
												});

											});
										}	
										
									})
									
								}

								
						
							});
						}else{
							return res.status(404).send({error: 'wallet', message: 'Please enter a valid address!'});
						}
					}
					
				});
			}

	}else{
		res.status(403).send('Forbidden')
	}
	
}
// function WithdrawSubmit(req, res){
// 	var amountUsd = parseFloat(req.body.amount);
	
// 	if(!amountUsd)
// 		return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance'});
	
// 	var type = req.body.type;
// 	var wallet = req.body.wallet;
	
// 	var user = req.user;
// 	let newWithdraw = new Withdraw();

	
	
	
// 	if (type == 'btc' || type == 'coin' && wallet != '' && !isNaN(amountUsd)) {

// 			// type = Coin
// 			var ast_balance = parseFloat(user.balance.coin_wallet.available);

// 			if (parseFloat(ast_balance) < parseFloat(amountUsd) || parseFloat(amountUsd) <= 0) {
// 				return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance!'});
// 			}else{

// 				STCclient.validateAddress(wallet, function (err, valid) {
// 					if(err){
// 						return res.status(404).send('Error Validate Address!');
// 					}else{
// 						if (valid.isvalid) {
// 							Ticker.findOne({},(err,data_ticker)=>{
// 								if (err) {
// 									return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance!'});
// 								}else{
// 									var ast_usd = parseFloat(data_ticker.price_usd);
								
// 									var ast_withdraw_usd = (parseFloat(amountUsd)*parseFloat(ast_usd)).toFixed(8);
// 										ast_withdraw_usd = parseFloat(ast_withdraw_usd);
// 										console.log(ast_balance);
// 										console.log(amountUsd);
// 									var new_ast_balance = parseFloat(ast_balance - amountUsd).toFixed(8);
// 									var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
// 									var withdraw_uid = (new Date().getTime()).toString(36);
// 									var data_update = {
// 										$push: {
// 											'withdraw': {
// 												"withdraw_id": withdraw_uid,
// 												"active_email" : 0,
// 												"amount" : amountUsd,
// 												"amount_usd" : parseFloat(ast_withdraw_usd),
// 												"user_id" : user._id,
// 												"status" : 'pending',
// 												"username": user.displayName,
// 												"wallet": wallet,
// 												"txid": '',
// 												"fee": 0,
// 												"date": Date.now(),
// 												"type": 'LEC',
// 												"token_withdraw": token_withdraw
// 											}
// 										}
// 									};
// 									User.update({_id:user._id}, data_update, function(err, UsersUpdate){
// 										if(err) res.status(500).send({message: `Error`})
// 										var query = {_id:user._id};
// 										var data_update = {
// 											$set : {
// 												'balance.coin_wallet.available': parseFloat(new_ast_balance)
// 											},
// 											$push: {
// 												'balance.coin_wallet.history': {
// 													date: Date.now(), 
// 													type: 'sent', 
// 													amount: amountUsd, 
// 													detail: 'Withdraw ' +parseFloat(amountUsd) + ' STC ($ '+ast_withdraw_usd+') <br> Exchange rate: 1 STC = '+parseFloat(ast_usd)+' USD'
// 												}
// 											}
// 										};
// 										User.update(query, data_update, function(err, UsersUpdate){
// 											if(err) res.status(500).send({message: `Error`})

// 											mailConfirmWithdraw(token_withdraw, amountUsd, wallet, user, function(data){
											
// 												return res.status(200).send({error: '', status: 1, message: 'Withdraw success'});
// 											});

// 										});
										
// 									});
// 								}

								
						
// 							});
// 						}else{
// 							return res.status(404).send({error: 'wallet', message: 'Please enter a valid address!'});
// 						}
// 					}
					

// 				});
// 			}




// 	}else{
// 		res.status(403).send('Forbidden')
// 	}
	
// }
function LoadDataWithdraw(req, res){
	Withdraw.find({user_id: req.session.userId},(err,data)=>{
		
		if(err) return res.status(500).send({message:`Error load your withdraw`})
		let data_withdraw = data;
	

		var new_data_withdraw = [];
		if (data_withdraw == undefined || _.size(data_withdraw) === 0)
			return res.status(404).send({message: 'No data'});

		_.forEach(data_withdraw, function(value) {
			new_data_withdraw.push({
				'date': moment(value.date).format('MM/DD/YYYY LT'),
				'amount': value.amount,
				'type': value.type, 
				'status': (value.status == 'pending' ? 'Pending' : 'Completed'),
				'wallet': value.wallet,
				'txid': value.txid
			});
		});
		return res.status(200).send({withdraw: new_data_withdraw});

	})
}
// function LoadDataWithdraw(req, res){
// 	User.findOne({_id: req.session.userId}, { "withdraw": 1 },(err,data)=>{
		
// 		if(err) return res.status(500).send({message:`Error load your withdraw`})
// 		let data_withdraw = data.withdraw;
	

// 		var new_data_withdraw = [];
// 		if (data_withdraw == undefined || _.size(data_withdraw) === 0)
// 			return res.status(404).send({message: 'No data'});

// 		_.forEach(data_withdraw, function(value) {
// 			new_data_withdraw.push({
// 				'date': moment(value.date).format('MM/DD/YYYY LT'),
// 				'amount': value.amount,
// 				'type': value.type, 
// 				'status': (value.status == 'pending' ? 'Pending' : 'Completed'),
// 				'wallet': value.wallet,
// 				'txid': value.txid
// 			});
// 		});
// 		return res.status(200).send({withdraw: new_data_withdraw});

// 	})
// }
function mailConfirmWithdraw(token_withdraw, amount_ast, address_stc, user, withdrawStored, callback){
    let link_token_ = "https://sfccoin.co/de495b769293abf4edf3e08a021a?token="+token_withdraw + "_" + user._id+ "_" + withdrawStored._id+"";


   var content = '<h1 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 24px; line-height: 27px; color: #333333; font-weight: normal;">Hello,</h1>';
    content += '<p style="margin: 0;">A request to withdraw '+amount_ast+' BBL from your Bitbeeline account to address '+address_stc+' was just made.</p>';
    content += '<p style="margin: 0;margin-top: 10px;">To confirm the withdrawal, please click the following link:  <a href="'+link_token_+'">Click to Confirm withdraw</p>';

    content += '<p style="margin: 0;margin-top: 10px;">Thank you for using our service</p>';
    
    var html = '<!DOCTYPE html> <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style> html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; } * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; } div[style*="margin: 16px 0"] { margin: 0 !important; } table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; } table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; } table table table { table-layout: auto; } img { -ms-interpolation-mode:bicubic; } *[x-apple-data-detectors], .x-gmail-data-detectors, .x-gmail-data-detectors *, .aBn { border-bottom: 0 !important; cursor: default !important; color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } .a6S { display: none !important; opacity: 0.01 !important; } img.g-img + div { display: none !important; } .button-link { text-decoration: none !important; } </style> <style> .button-td, .button-a { transition: all 100ms ease-in; } .button-td:hover, .button-a:hover { background: #555555 !important; border-color: #555555 !important; } @media screen and (max-width: 600px) { .email-container p { font-size: 17px !important; line-height: 22px !important; } } </style> </head> <body width="100%" bgcolor="#222222" style="margin: 0; padding: 30px 0;mso-line-height-rule: exactly;"> <center style="width: 100%; background: #222222; text-align: left;"> <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> </div> <div style="max-width: 600px; margin: auto;margin-top: 20px;" class="email-container"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"> <tr> <td bgcolor="#00A2F2" align="center"> <img src="https://bitbeeline.co/assets/img/logo.png" width="400" height="" alt="alt_text" border="0" align="center" style="width: 40%; min-width: 200px; max-width: 600px; height: auto; background: #00A2F2; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; margin: auto;" class="g-img"> </td> </tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">';
    html += content;
    html += '</td> </tr> </table> </td> </tr>  <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;"> <p style="margin: 0;"></p> </td> </tr> </table> </td> </tr> </table> <table style="table-layout:fixed;width:100%;margin:0 auto;background-color:#fff; margin-top: 20px;padding: 20px;"> <tbody> <tr style="color:#799eb2; padding: 20px;"> <td style="text-align:left;padding-top:30px; padding-left: 40px">Get Bitbeeline on your phone</td> <td style="text-align:right;padding-top:30px;padding-right: 40px">Follow our updates</td> </tr> <tr> <td style="text-align:left;padding-left: 40px"> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci4.googleusercontent.com/proxy/_WaQMacvsKYTJOOGhioMR8OF_BU2S8Zym04san2sSmT62yfAPXDPLCkPttHDl1D4cINvDg=s0-d-e1-ft#http://i.imgur.com/NLjQwKZ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci6.googleusercontent.com/proxy/PdRspPI2qeGPVehi1uAs-ySzy0eDR9_NgrkyvGE0GEyqpZfn8t8gv2jjm5wWp5WBi1cTfQ=s0-d-e1-ft#http://i.imgur.com/dyZhztJ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> <td style="text-align:right;padding-right: 40px"> <a href="https://www.facebook.com/sharer/sharer.php?u=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://www.facebook.com/groups/SantaCoin/&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNHvknyoKoZhymbsaULxwxDAQXg9Lg"> <img width="40" style="padding-left:5px" src="https://imgur.com/3COJChV.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://twitter.com/intent/tweet?text=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://twitter.com/SANTA_COIN&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNG0JpTzMgnqtsH5bejKGUdHsTpu8Q"> <img width="40" style="padding-left:5px" src="https://imgur.com/xB1yYPh.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a target="_blank" href="https://plus.google.com/up/accounts/upgrade/?continue=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://imgur.com/q8WrSm1.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://www.reddit.com/submit?url=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://i.imgur.com/JDHVtUW.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> </tr> </tbody> </table> </div> </center> </body> </html>';
    
    var email = {
        "html" : html,
        "text" : "Sfccoin",
        "subject" : "Sfccoin - Withdrawal Confirmation",
        "from" : {
            "name" : "",
            "email" : 'no-reply@sfccoin.co'
        },
        "to" : [
            {
                "name" : "",
                "email" : user.email
            }
        ]
    };
    var answerGetter = function answerGetter(data){
        console.log(data);
    }
    sendpulse.smtpSendMail(answerGetter,email);
    callback('success');
    //  let mailOptions = {
    //     from: '<santacoin.co@gmail.com>', // sender address
    //     to: user.email, // list of receivers
    //     subject: 'Withdrawal Confirmation', // Subject line
    //     html: html_body // html body
    // };


    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         callback(false);
    //     }else{
    //     	callback('success');
    //     }
      
    // });

    
}
function active(req, res) {
	let token = null;
	_.has(req.query, 'token') ? (
		token = _.split(req.query.token, '_'),
		token.length > 1 && (
			Withdraw.findOneAndUpdate({
				'_id': token[2],
				'user_id' : token[1],
				'token_withdraw' : token[0],
				'active_email' : 0
			}, {
				'active_email' : 1,
				'status' : 'finish'
			}, function(err, result){
				if (result)
				{
					if (result.type == 'BCH')
					{
						var wallet = result.wallet;
						var amount = result.amount;
						//send form
						/*BCHclient.sendFrom("account_admin",wallet,parseFloat(amount), function (err, result) {
                            if (err){
                                return res.status(500).send({message: "Transaction failed, Please try again"});
                            }
                            else
                            {
                            	return res.status(200).send({message: 'Successful transaction'});
                            }
                        });*/
					}

					if (result.type == 'BTC')
					{
						var wallet = result.wallet;
						var amount = result.amount;
						//send form
						/*BTCclient.sendFrom("account_admin",wallet,parseFloat(amount), function (err, result) {
                            if (err){
                                return res.status(500).send({message: "Transaction failed, Please try again"});
                            }
                            else
                            {
                            	return res.status(200).send({message: 'Successful transaction'});
                            }
                        });*/
					}


					if (result.type == 'BBL')
					{
						var wallet = result.wallet;
						var amount = result.amount;
						//send form
						/*STCclient.sendFrom("account_admin",wallet,parseFloat(amount), function (err, result) {
                            if (err){
                                return res.status(500).send({message: "Transaction failed, Please try again"});
                            }
                            else
                            {
                            	return res.status(200).send({message: 'Successful transaction'});
                            }
                        });*/
					}
					

					res.redirect('/login-system.html')
				}
				else
				{
					res.redirect('/login-system.html');
				}
			})
		)
	) : (
		res.redirect('/login-system.html')
	)
}
module.exports = {
	Index,
	WithdrawSubmit,
	LoadDataWithdraw,
	active
}