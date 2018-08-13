'use strict'

const User = require('../../models/user');
const Withdraw = require('../../models/withdraw');
const Ticker = require('../../models/ticker');
const Invest = require('../../models/invest');
const IcoSum = require('../../models/icosum');
const Ico = require('../../models/ico');
const moment = require('moment');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const Order = require('../../models/order');
const nodemailer = require('nodemailer');
var sendpulse = require("sendpulse-api");
function ListIco(req, res){
	IcoSum.findOne({},(err,total_ico)=>{
		Order.find({status: '0'}, (err, data)=>{
			if (err) {
				res.status(500).send({'message': 'data not found'});
			}else{
				// res.status(200).send(users);
				res.render('admin/ico', {
					title: 'Ico',
					layout: 'layout_admin.hbs',
					ico: data,
					total_ico : total_ico
				});
			}
		})
	})
}

function ListIcohistory(req, res){
	Order.find({}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			// res.status(200).send(users);
			res.render('admin/ico_history', {
				title: 'Ico',
				layout: 'layout_admin.hbs',
				ico: data
			});
		}
	})
}

function FindOrder(order_id,callback){
	Order.findById(order_id, (err, data) => {
		err || !data ? callback(false) : callback(data);
	 });
}
var update_balace = function(name , new_ast_balance,user_id,callback){
	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'BCH') obj =  {'balance.bitcoincash_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'BCC') obj = {'balance.bitconnect_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'LTC') obj = {'balance.litecoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BBL') obj = {'balance.coin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'DASH') obj = {'balance.dashcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XVG') obj = {'balance.verge_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BTG') obj = {'balance.bitcoingold_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XZC') obj = {'balance.zcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'ETH') obj = {'balance.ethereum_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'BTC' && callback(data.balance.bitcoin_wallet.available),
			name === 'BCH' && callback(data.balance.bitcoincash_wallet.available),
			name === 'BCC' && callback(data.balance.bitconnect_wallet.available),
			name === 'LTC' && callback(data.balance.litecoin_wallet.available),
			name === 'BBL' && callback(data.balance.coin_wallet.available),
			name === 'DASH' && callback(data.balance.dashcoin_wallet.available),
			name === 'XVG' && callback(data.balance.verge_wallet.available),
			name === 'BTG' && callback(data.balance.bitcoingold_wallet.available),
			name === 'XZC' && callback(data.balance.zcoin_wallet.available),
			name === 'ETH' && callback(data.balance.ethereum_wallet.available)
		) : callback (balance) 
	})
}
function CanelICO(req, res){
	var query_update;
	var data_update;
	FindOrder(req.params.id,function(data){
		data && data.status == 0 ? (
			query_update = {_id:data._id},
			data_update = {$set : {'status': 3}},
			Order.update(query_update,data_update,function(err, newUser){
				get_balance(data.method_payment,data.user_id,function(balance_user){
					var new_ast_balance = parseFloat(balance_user) + parseFloat(data.amount_payment);
					update_balace(data.method_payment,new_ast_balance,data.user_id,function(callback){
						sendmail_cancel_ico(data.user_id,function(cbb){
							res.redirect('/qweqwe/admin/ico#success')
						})
					})
				});
	        })
		): res.redirect('/qweqwe/admin/ico#error')
	})
}

function EndICO(req, res){
	IcoSum.update({},{$set : {'status' : 0}},(err,result_order)=>{
		res.redirect('/qweqwe/admin/ico');
	}); 
}
function StartICO(req, res){
	IcoSum.update({},{$set : {'status' : 1}},(err,result_order)=>{
		res.redirect('/qweqwe/admin/ico');
	}); 
}
function TotalBuy(req, res){
	IcoSum.update({},{$set : {'total' :parseFloat(req.body.total)}},(err,result_order)=>{
		res.redirect('/qweqwe/admin/ico');
	}); 
}

var getUser = function(id_user,callback){
	User.findById(id_user, function(err, user) {
		err || !user ? callback(null) : callback(user);
	});
}
var update_balace_bbl = function(new_ast_balance,user_id,callback){
	var query = {_id:user_id};
	var data_update = {
		$set : {
			'balance.coin_wallet.available': parseFloat(new_ast_balance)
		}
	};
	User.update(query, data_update, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var update_balance_ico_add = function(user_id,amount,callback){
	getUser(user_id,function(user){
		if (user) 
		{
			var ast_balance = parseFloat(user.balance.coin_wallet.available);
			var new_ast_balance = parseFloat(ast_balance + amount).toFixed(8);
			update_balace_bbl(new_ast_balance,user._id,function(calb){
				calb ? callback(true) : callback(false);
			})
		}
		else
		{
			callback(false)
		}
	});
}




var	commision_referral = function(user_id,amount_coin,callback){
	var coin_balance;
	var new_ast_balance;
	var query;
	var data_update;
	User.findById(user_id, function(err, user_curent) {
		(!err && user_curent) || parseInt(user_curent.p_node) != 0  ? (
			User.findById(user_curent.p_node, function(err, user) {
				!err && user ? (
					coin_balance = parseFloat(user.balance.coin_wallet.available),
					new_ast_balance = parseFloat(coin_balance + amount_coin*0.05),
					query = {_id:user_curent.p_node},
					data_update = {
						$set : {
							'balance.coin_wallet.available': parseFloat(new_ast_balance)
						},
						$push: {
							'balance.coin_wallet.history': {
								'date': Date.now(), 
								'type': 'refferalico', 
								'amount': parseFloat(amount_coin*0.05), 
								'detail': 'Get '+amount_coin*0.05/100000000+' BBL from ID '+user_curent.displayName+' buying '+parseFloat(amount_coin)/100000000+' BBL'
							}
						}
					},
					User.update(query, data_update, function(err, UsersUpdate){
						err ? callback(false) : callback(true);
					})
				) : callback(false)
			})
		): callback(false)
	});
}


function MatchedICO(req, res){
	var query;
	var data_update;
	FindOrder(req.params.id,function(result_order){
		result_order && result_order.status == 0 ? (
			query = {_id:result_order._id},
			data_update = {$set : {'status': 1}},
			Order.update(query,data_update,function(err, newUser){
				update_balance_ico_add(result_order.user_id,parseFloat(result_order.amount_coin),function(cb_add){
					if (cb_add)
					{
						commision_referral(result_order.user_id,parseFloat(result_order.amount_coin),function(callback){
							IcoSum.findOne({}, (err, sum) => { 
								var total = (parseFloat(sum.total) + (parseFloat(result_order.amount_coin)/100000000)).toFixed(8);
						    	sum.total = parseFloat(total);
						        sum.save((err, sum) => {
						        	sendmail_matching_ico(result_order.user_id,function(cbb){
						        		res.redirect('/qweqwe/admin/ico#success')
						        	})
						        });
							});
						})
					}
				})
	        })
		): res.redirect('/qweqwe/admin/ico#error')
	})
}

const sendmail_matching_ico = function (user_id,callback){
	User.findOne({'_id' : user_id},(err,user)=>{
	    var API_USER_ID= "e0690653db25307c9e049d9eb26e6365"
	    var API_SECRET= "3d7ebbb8a236cce656f8042248fc536e"
	    var TOKEN_STORAGE="/tmp/"
	    sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);
	    const answerGetter = function answerGetter(data){
	        console.log(data);
	    }
	    var content = '<p style="margin: 0;margin-top: 10px;">Dear '+user.displayName+'</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">Congratulations !</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">Your order perfectly finished. Please checking your BBL wallet</p>';
	    var html = '<!DOCTYPE html> <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style> html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; } * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; } div[style*="margin: 16px 0"] { margin: 0 !important; } table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; } table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; } table table table { table-layout: auto; } img { -ms-interpolation-mode:bicubic; } *[x-apple-data-detectors], .x-gmail-data-detectors, .x-gmail-data-detectors *, .aBn { border-bottom: 0 !important; cursor: default !important; color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } .a6S { display: none !important; opacity: 0.01 !important; } img.g-img + div { display: none !important; } .button-link { text-decoration: none !important; } </style> <style> .button-td, .button-a { transition: all 100ms ease-in; } .button-td:hover, .button-a:hover { background: #555555 !important; border-color: #555555 !important; } @media screen and (max-width: 600px) { .email-container p { font-size: 17px !important; line-height: 22px !important; } } </style> </head> <body width="100%" bgcolor="#222222" style="margin: 0;     padding: 30px 0;mso-line-height-rule: exactly;"> <center style="width: 100%; background: #222222; text-align: left;"> <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> </div> <div style="max-width: 600px; margin: auto;margin-top: 20px;" class="email-container"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"> <tr> <td bgcolor="#00A2F2" align="center"> <img src="https://bitbeeline.co/assets/img/logo.png" width="120" height="" alt="alt_text" border="0" align="center" style="width: 15%; min-width: 120px; max-width: 200px; height: auto; background: #00A2F2; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; margin: auto;" class="g-img"> </td> </tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr><td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">';
	    html += content;
	    html += '</td> </tr> </table> </td> </tr></tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;"> <p style="margin: 0;">You received this message because you registered an account and accepted to use our services. Thank you</p> </td> </tr> </table> </td> </tr> </table> <table style="table-layout:fixed;width:100%;margin:0 auto;background-color:#fff; margin-top: 20px;padding: 20px;"> <tbody> <tr style="color:#799eb2; padding: 20px;"> <td style="text-align:left;padding-top:30px; padding-left: 40px">Get Bitbeeline on your phone</td> <td style="text-align:right;padding-top:30px;padding-right: 40px">Follow our updates</td> </tr> <tr> <td style="text-align:left;padding-left: 40px"> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci4.googleusercontent.com/proxy/_WaQMacvsKYTJOOGhioMR8OF_BU2S8Zym04san2sSmT62yfAPXDPLCkPttHDl1D4cINvDg=s0-d-e1-ft#http://i.imgur.com/NLjQwKZ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci6.googleusercontent.com/proxy/PdRspPI2qeGPVehi1uAs-ySzy0eDR9_NgrkyvGE0GEyqpZfn8t8gv2jjm5wWp5WBi1cTfQ=s0-d-e1-ft#http://i.imgur.com/dyZhztJ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> <td style="text-align:right;padding-right: 40px"> <a href="https://www.facebook.com/sharer/sharer.php?u=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://www.facebook.com/groups/SantaCoin/&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNHvknyoKoZhymbsaULxwxDAQXg9Lg"> <img width="40" style="padding-left:5px" src="https://imgur.com/3COJChV.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://twitter.com/intent/tweet?text=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://twitter.com/SANTA_COIN&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNG0JpTzMgnqtsH5bejKGUdHsTpu8Q"> <img width="40" style="padding-left:5px" src="https://imgur.com/xB1yYPh.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a target="_blank" href="https://plus.google.com/up/accounts/upgrade/?continue=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://imgur.com/q8WrSm1.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://www.reddit.com/submit?url=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://i.imgur.com/JDHVtUW.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> </tr> </tbody> </table> </div> </center> </body> </html>';
	    
	    var email = {
	        "html" : html,
	        "text" : "Bitbeeline",
	        "subject" : "ICO INFORMATION",
	        "from" : {
	            "name" : "Bitbeeline Mailer",
	            "email" : "no-reply@bitbeeline.co"
	        },
	        "to" : [
	            {
	                "name" : "",
	                "email" : user.email
	            }
	        ]
	    };
	    sendpulse.smtpSendMail(answerGetter,email);
	    callback(true);
	})
}

const sendmail_cancel_ico = function (user_id,callback){
	User.findOne({'_id' : user_id},(err,user)=>{
	    var API_USER_ID= "e0690653db25307c9e049d9eb26e6365"
	    var API_SECRET= "3d7ebbb8a236cce656f8042248fc536e"
	    var TOKEN_STORAGE="/tmp/"
	    sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);
	    const answerGetter = function answerGetter(data){
	        console.log(data);
	    }
	    var content = '<p style="margin: 0;margin-top: 10px;">Dear '+user.displayName+'</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">Your order are not matched, please try again at next round !</p>';
	    var html = '<!DOCTYPE html> <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style> html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; } * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; } div[style*="margin: 16px 0"] { margin: 0 !important; } table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; } table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; } table table table { table-layout: auto; } img { -ms-interpolation-mode:bicubic; } *[x-apple-data-detectors], .x-gmail-data-detectors, .x-gmail-data-detectors *, .aBn { border-bottom: 0 !important; cursor: default !important; color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } .a6S { display: none !important; opacity: 0.01 !important; } img.g-img + div { display: none !important; } .button-link { text-decoration: none !important; } </style> <style> .button-td, .button-a { transition: all 100ms ease-in; } .button-td:hover, .button-a:hover { background: #555555 !important; border-color: #555555 !important; } @media screen and (max-width: 600px) { .email-container p { font-size: 17px !important; line-height: 22px !important; } } </style> </head> <body width="100%" bgcolor="#222222" style="margin: 0;     padding: 30px 0;mso-line-height-rule: exactly;"> <center style="width: 100%; background: #222222; text-align: left;"> <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> </div> <div style="max-width: 600px; margin: auto;margin-top: 20px;" class="email-container"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"> <tr> <td bgcolor="#00A2F2" align="center"> <img src="https://bitbeeline.co/assets/img/logo.png" width="120" height="" alt="alt_text" border="0" align="center" style="width: 15%; min-width: 120px; max-width: 200px; height: auto; background: #00A2F2; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; margin: auto;" class="g-img"> </td> </tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr><td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">';
	    html += content;
	    html += '</td> </tr> </table> </td> </tr></tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;"> <p style="margin: 0;">You received this message because you registered an account and accepted to use our services. Thank you</p> </td> </tr> </table> </td> </tr> </table> <table style="table-layout:fixed;width:100%;margin:0 auto;background-color:#fff; margin-top: 20px;padding: 20px;"> <tbody> <tr style="color:#799eb2; padding: 20px;"> <td style="text-align:left;padding-top:30px; padding-left: 40px">Get Bitbeeline on your phone</td> <td style="text-align:right;padding-top:30px;padding-right: 40px">Follow our updates</td> </tr> <tr> <td style="text-align:left;padding-left: 40px"> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci4.googleusercontent.com/proxy/_WaQMacvsKYTJOOGhioMR8OF_BU2S8Zym04san2sSmT62yfAPXDPLCkPttHDl1D4cINvDg=s0-d-e1-ft#http://i.imgur.com/NLjQwKZ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci6.googleusercontent.com/proxy/PdRspPI2qeGPVehi1uAs-ySzy0eDR9_NgrkyvGE0GEyqpZfn8t8gv2jjm5wWp5WBi1cTfQ=s0-d-e1-ft#http://i.imgur.com/dyZhztJ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> <td style="text-align:right;padding-right: 40px"> <a href="https://www.facebook.com/sharer/sharer.php?u=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://www.facebook.com/groups/SantaCoin/&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNHvknyoKoZhymbsaULxwxDAQXg9Lg"> <img width="40" style="padding-left:5px" src="https://imgur.com/3COJChV.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://twitter.com/intent/tweet?text=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://twitter.com/SANTA_COIN&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNG0JpTzMgnqtsH5bejKGUdHsTpu8Q"> <img width="40" style="padding-left:5px" src="https://imgur.com/xB1yYPh.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a target="_blank" href="https://plus.google.com/up/accounts/upgrade/?continue=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://imgur.com/q8WrSm1.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://www.reddit.com/submit?url=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://i.imgur.com/JDHVtUW.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> </tr> </tbody> </table> </div> </center> </body> </html>';
	    
	    var email = {
	        "html" : html,
	        "text" : "Bitbeeline",
	        "subject" : "ICO INFORMATION",
	        "from" : {
	            "name" : "Bitbeeline Mailer",
	            "email" : "no-reply@bitbeeline.co"
	        },
	        "to" : [
	            {
	                "name" : "",
	                "email" : user.email
	            }
	        ]
	    };
	    sendpulse.smtpSendMail(answerGetter,email);
	    callback(true);
	})
}

module.exports = {
	ListIco,
	CanelICO,
	MatchedICO,
	ListIcohistory,
	EndICO,
	StartICO,
	TotalBuy
	
}