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
var sleep = require('sleep');
var cron = require('node-cron');
var forEach = require('async-foreach').forEach;
var dateFormat = require('dateformat');
cron.schedule('00 00 11 * * *', function(){
	//CaculateProfit();	
});

function ListInvest(req, res){
	Invest.find({}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			var total = 0;
			var total_bbl = 0;
			var total_profit = 0;
			forEach(data, function(value, index){
				var done = this.async();
				total += parseFloat(value.amount);
				total_bbl += parseFloat(value.amount_coin);
				total_profit += parseFloat(value.interest);
				done();
				data.length - 1 === index && (
					res.render('admin/invest', {
						title: 'invest',
						layout: 'layout_admin.hbs',
						total : total,
						total_bbl : total_bbl,
						total_profit : total_profit,
						invest: data
					})
				)
			});
			
		}
	})
}


function CaculateProfit(req, res){
	/*console.log(req.body);
	let percent = parseFloat(req.body.percent),
		percent_today = parseFloat(req.body.percent),
		two =  parseInt(req.body.two),
		query={},
		data_update = {},
		interest = 0,
		commission = 0;

	var verified = speakeasy.totp.verify({
        secret: 'GRJTSPBQIM6D452GLA4CIYZDEU7T4KLUKRUTGQTWEM5HKPSNPFZA',
        encoding: 'base32',
        token: two
    });
    if (verified) 
    {*/
    var date_last = dateFormat(new Date().toLocaleString(), "yyyy-mm-dd h:MM:ss");
   	Invest.find({}, function(err, data){
   		if (err) 
   		{
   			console.log('no data');
   		}
   		else
   		{
   			forEach(data, function(value, index){
				var done = this.async();
				var percent = 0;
       			if (parseFloat(value.amount) >= 100 && parseFloat(value.amount) < 1000)
       			{
	                percent = 1;
       			}
	            else if (parseFloat(value.amount) >= 1000 && parseFloat(value.amount) < 5000) 
	            {
	                percent = 1.1;
	            }
	            else if (parseFloat(value.amount) >= 5000 && parseFloat(value.amount) < 10000) 
	            {
	                percent = 1.23;
	            }
	            else if (parseFloat(value.amount) >= 10000) 
	            {
	                percent = 1.4;
	            }
	            console.log(percent);
	            
       			User.findById(value.user_id, (err, users) => {

       			 	if (err || !users || parseFloat(percent) == 0)
       			 	{
       			 		done();
       			 		console.log('Error');
       			 	}
       			 	else
       			 	{	
       			 		var amount_daily = parseFloat(percent)*parseFloat(value.amount)/100;
       			 		var new_interest = (parseFloat(value.interest)+parseFloat(amount_daily)).toFixed(3);

       			 		var available = parseFloat(users.balance.lending_wallet.available);
			            var new_available = (parseFloat(available) + parseFloat(amount_daily)).toFixed(3);
			            var total_earn = (parseFloat(users.total_earn)).toFixed(3);
			            var new_total_earn = (parseFloat(total_earn) + parseFloat(amount_daily)).toFixed(3);

			            var string = value.username + '----' +amount_daily + '------ ' + value.amount + ' ----- ' + percent +' ---' + new_interest+ '---' +new_available + ' ----------- ' +new_total_earn;
			            
			            console.log(string);

			            var query_update = { _id : value.user_id };
			            var data_update = { 
		                    $set: {
		                          'balance.lending_wallet.available': new_available,
		                          'total_earn': new_total_earn
		                      },
		                    $push: {
		                          'balance.lending_wallet.history': {
		                            'date': Date.now(), 
		                            'type': 'daily_profit', 
		                            'amount': parseFloat(amount_daily).toFixed(3), 
		                            'detail': 'Get '+parseFloat(percent)+'% profit daily from package '+value.amount+' USD'
		                          }
		                        }
		                };
			            
			            User.update(query_update, data_update, function(err, UsersUpdate){
			            	var new_day;
							!err ? (
								new_day =  parseInt(value.days) - 1,
								Invest.update({_id : value._id}, {$set : {'interest' : new_interest, 'days' : new_day,'date_last' : date_last}}, function(err, UsersUpdate){
									console.log(data.length,index);
					            	data.length - 1 === index && res.status(200).send({'message': 'complete'});
					            	console.log('complete item '+index);
					            	setTimeout(function() {
										done()
									}, 500);
								})
							) : (
								console.log('fail'),
								done()
							)
						})
       			 	}
       			});

			});
       		 
   		}
   	
	})
    /*} 
    else 
    {
        res.status(500).send({'message': 'Error Two Factor Authentication'});
    }*/

}

function SubmitInvest(req, res){
	var _id = req.params.id;
	var date_last = dateFormat(new Date().toLocaleString(), "yyyy-mm-dd h:MM:ss");
	Invest.findById(_id, function(err, value){
   		if (err) 
   		{
   			console.log('no data');
   		}
   		else
   		{
			var percent = 0;
   			if (parseFloat(value.amount) >= 100 && parseFloat(value.amount) < 1000)
   			{
                percent = 1;
   			}
            else if (parseFloat(value.amount) >= 1000 && parseFloat(value.amount) < 5000) 
            {
                percent = 1.1;
            }
            else if (parseFloat(value.amount) >= 5000 && parseFloat(value.amount) < 10000) 
            {
                percent = 1.23;
            }
            else if (parseFloat(value.amount) >= 10000) 
            {
                percent = 1.4;
            }
            console.log(percent);
            
   			User.findById(value.user_id, (err, users) => {

   			 	if (err || !users || parseFloat(percent) == 0)
   			 	{
   			 		
   			 		console.log('Error');
   			 	}
   			 	else
   			 	{	
   			 		var amount_daily = parseFloat(percent)*parseFloat(value.amount)/100;
   			 		var new_interest = (parseFloat(value.interest)+parseFloat(amount_daily)).toFixed(3);

   			 		var available = parseFloat(users.balance.lending_wallet.available);
		            var new_available = (parseFloat(available) + parseFloat(amount_daily)).toFixed(3);
		            var total_earn = (parseFloat(users.total_earn)).toFixed(3);
		            var new_total_earn = (parseFloat(total_earn) + parseFloat(amount_daily)).toFixed(3);

		            var string = value.username + '----' +amount_daily + '------ ' + value.amount + ' ----- ' + percent +' ---' + new_interest+ '---' +new_available + ' ----------- ' +new_total_earn;
		            
		            console.log(string);

		            var query_update = { _id : value.user_id };
		            var data_update = { 
	                    $set: {
	                          'balance.lending_wallet.available': new_available,
	                          'total_earn': new_total_earn
	                      },
	                    $push: {
	                          'balance.lending_wallet.history': {
	                            'date': Date.now(), 
	                            'type': 'daily_profit', 
	                            'amount': parseFloat(amount_daily).toFixed(3), 
	                            'detail': 'Get '+parseFloat(percent)+'% profit daily from package '+value.amount+' USD'
	                          }
	                        }
	                };
		            
		            User.update(query_update, data_update, function(err, UsersUpdate){
		            	var new_day;
						!err ? (
							new_day =  parseInt(value.days) - 1,
							Invest.update({_id : value._id}, {$set : {'interest' : new_interest, 'days' : new_day,'date_last' : date_last}}, function(err, UsersUpdate){
								
				            	res.redirect('/qweqwe/admin/invest#complete')
							})
						) : (
							console.log('fail'),
							res.redirect('/qweqwe/admin/invest#fail')
						)
					})
   			 	}
   			});

			
       		 
   		}
   	
	})
}


module.exports = {
	
	ListInvest,
	CaculateProfit,
	SubmitInvest
}