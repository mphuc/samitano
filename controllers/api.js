'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Withdraw = require('../models/withdraw');
const service = require('../services');
const moment = require('moment');
const Ico = require('../models/ico');
const _ = require('lodash');
const IcoSum = require('../models/icosum');
const Ticker = require('../models/ticker');
const Order = require('../models/order');
const request = require('request');
const bitcoin = require('bitcoin');

var cron = require('node-cron');
cron.schedule('*/10 * * * *', function(){
  //updatePriceUsd();
});

cron.schedule('59 59 09 * * *', function(){
	IcoSum.update({},{$set : {'status' : 1}},(err,result_order)=>{
	}); 
	console.log('start ICO');
});

function IndexOn(req,res){
	Order.find({'user_id' : req.user._id},(err,result_order)=>{
		IcoSum.findOne({},(err,result)=>{
	    	get_price_ico(function(price_ico){
	    		get_date_ico(function(date_start){
		    		res.locals.title = 'INITIAL COIN OFFERING';
					res.locals.menu = 'ico';
					res.locals.user = req.user;
					res.locals.order_history = result_order;
					res.locals.price_ico = price_ico;
					res.locals.total_buy = result.total;
					res.locals.total_ico = result;
					res.locals.date_start = date_start;
					res.render('account/ico');
				});
	    	});	
	    	
		    
		});
	});
}

function get_date_ico(callback){
	var date = new Date();
	date = date.setDate(date.getDate());
	date = new Date(date);
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var d = year+'/'+month+'/'+day+' '+'22:00:00';
	callback(d);
}

function SumitBuy(req,res){

	IcoSum.findOne({},(err,total_ico)=>{
		if (err || parseInt(total_ico.status) == 0)
		{
			return res.status(401).send({  message: 'The time to open ICO sale today has ended. Please come back the next day.' });
		}
		else
		{
			var amount_coin = parseFloat(req.body.amount_coin);;
			var user = req.user;

			var payment_method = req.body.payment_method;
			if ( !amount_coin || !amount_coin || isNaN(amount_coin) || amount_coin < 50)
				return res.status(404).send({message: 'Please enter amount > 50 SFCC!'});
			if ( !amount_coin || !amount_coin || isNaN(amount_coin) || amount_coin > 300)
				return res.status(404).send({message: 'Please enter amount < 300 SFCC!'});
			
			if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
		    {
		        return res.status(401).send({ message : 'Please select captcha'});
		    }
		    const secretKey = "6LfTIDYUAAAAAIweBOTHOlRspskGWNq7bxmat9Ow";

		    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

		    request(verificationURL,function(error,response,body) {
		        body = JSON.parse(body);
		        
		        if(body.success !== undefined && !body.success) {
		            return res.status(401).send({
		                    error : 'Please select captcha'
		                });
		        }
		        else
		        {
		        	Order.find({"$and" : [{'user_id' : req.user._id}, {'status' : 0} ]},(err,check_buy)=>{

						if (check_buy.length == 0)
						{
							if (payment_method == 'BTC')
							{

								Get_Price_BTC_USD(function(price_usd){
									get_price_ico(function(price_ico){
										var amount_send = (price_ico/price_usd*amount_coin).toFixed(8);
										var btc_balance = parseFloat(user.balance.bitcoin_wallet.available);
										if (parseFloat(btc_balance) >= parseFloat(amount_send))
										{
											create_order(parseFloat(amount_coin)*100000000,parseFloat(amount_send)*100000000,payment_method,user,function(cb){
												if (!cb) return res.status(500).send({message: `Error Buy`})
												else{
													return res.status(200).send({error: '', status: 1, message: 'Buy ICO success'});
												}
											})
										}
										else
										{
											return res.status(404).send({message:'Your bitcoin balance is not enough'});
										}
									});
								});
							}
							else
							{
								Get_Price_BTG_USD(function(price_usd){
									get_price_ico(function(price_ico){
										var amount_send = (price_ico/price_usd*amount_coin).toFixed(8);
										var btc_balance = parseFloat(user.balance.bitcoingold_wallet.available);
										if (parseFloat(btc_balance) >= parseFloat(amount_send))
										{
											create_order(parseFloat(amount_coin)*100000000,parseFloat(amount_send)*100000000,payment_method,user,function(cb){
												if (!cb) return res.status(500).send({message: `Error Buy`})
												else
													return res.status(200).send({error: '', status: 1, message: 'Buy ICO success'});
											})
										}
										else
										{
											return res.status(404).send({message:'Your bitcoin gold balance is not enough'});
										}
									});
								})
							}
						}
						else
						{
							return res.status(404).send({message:'You are ordering ICO.'});
						}
					});
		        }
		    });
		}
	});
};

function get_username_node(user_id,callback){
	User.findById(user_id, function(err, user_curent) {

		console.log(user_curent,user_id);

		(err || !user_curent) ? callback('') : callback(user_curent.displayName);
	});
}

function update_total_buy_ico(amount_coin,callback){
	IcoSum.findOne({},(err,result)=>{
	    var new_total = parseFloat(result.total) + parseFloat(amount_coin);
		var data_update = {
			$set : {
				'total': new_total
			}
		};
		IcoSum.update({},data_update,(err,new_data_ticker)=>{
			callback(true);
		})
	});
}

function create_order(amount_coin,amount_send,type,user,callback){

	get_username_node(user.p_node,function(name_node){
		let newOrder = new Order();
		var today = moment();
		newOrder.amount_coin = amount_coin;
		newOrder.amount_payment = amount_send;
		newOrder.method_payment = type;
		newOrder.user_id = user._id;
		newOrder.status = 0;
		newOrder.username = user.displayName;
		newOrder.name_node = name_node;
		newOrder.date = moment(today).format();
		newOrder.save((err, OrderStored)=>{
			if(err){
				callback(false);	
			}
			else
			{
				callback(true);
			}
		});
	})

	
}

function GetPriceByICO(req,res){
	if (req.body.payment_method && req.body.amount_coin)
	{
		var payment_method = req.body.payment_method;
		var amount_coin = parseFloat(req.body.amount_coin);
		
		get_price_ico(function(price_ico){
			if (payment_method == 'BTC')
			{
				Get_Price_BTC_USD(function(price){
					var result = ((price_ico/price)*amount_coin).toFixed(8);
					return res.status(200).send({'result' : result});
				});
			}
			if (payment_method == 'BTG')
			{
				Get_Price_BTG_USD(function(price){
					var result = ((price_ico/price)*amount_coin).toFixed(8);
					return res.status(200).send({'result' : result});
				});
			}
		});
		
	}
}

function get_price_ico(callback){
	Ticker.findOne({}, (err, result) => {  
		callback(result.price_usd);
	});
}

function Get_Price_BTC_USD(callback){
	request({
        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
        json: true
    }, function(error, response, body) {
    	if (!body || error) {
    		return res.status(200).send('false');
    	}
		var price_usd = parseFloat(body[0].price_usd);
		callback(price_usd);
	});
}

function Get_Price_BTG_USD(callback){
	request({
        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin-gold',
        json: true
    }, function(error, response, body) {
    	if (!body || error) {
    		return res.status(200).send('false');
    	}
		var price_usd = parseFloat(body[0].price_usd);
		callback(price_usd);
	});
}




module.exports = {
	
	IndexOn,
	SumitBuy,
	GetPriceByICO
}