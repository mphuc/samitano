'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Invest = require('../models/invest');
const service = require('../services');
const moment = require('moment');
const nodemailer = require('nodemailer');
const Ticker = require('../models/ticker');
var _ = require('lodash');
const bitcoin = require('bitcoin');
const Withdraw = require('../models/withdraw');
const Deposit = require('../models/deposit');
const bcrypt = require('bcrypt-nodejs');

var sendpulse = require("sendpulse-api");
var sendpulse = require("../models/sendpulse.js");
var config = require('../config'); 
var speakeasy = require('speakeasy');
const amqp = require('amqplib/callback_api');
var API_USER_ID= 'e0690653db25307c9e049d9eb26e6365';
var API_SECRET= '3d7ebbb8a236cce656f8042248fc536e';
var TOKEN_STORAGE="/tmp/";
const sendRabimq = require('../rabbit_comfim');
const Order = require('../models/order');
const Bank = require('../models/bank');
const request = require('request');
const OrderBuy = require('../models/exchange/orderbuy').module();
const OrderSell = require('../models/exchange/ordersell').module();
const MarketHistory = require('../models/exchange/markethistory').module();
sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);



function TempalteOffersBuy(req,res){
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			req.session.token_crt = token_withdraw;	
			res.locals.title = 'Khởi tạo giao dịch';
			res.locals.menu = 'offers';
			res.locals.user = req.user;
			res.locals.order = data;
			res.locals.has_login = true;
			res.locals.token_crt = token_withdraw;
			res.render('account/offers-buy');
		}
		else
		{
			res.redirect('/')
		}
	})	
}
function TempalteOffersSell(req,res){
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'status' : 0} ]},(err,data)=>{
		if (!err && data)
		{
			var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			req.session.token_crt = token_withdraw;	
			res.locals.title = 'Khởi tạo giao dịch';
			res.locals.menu = 'offers';
			res.locals.user = req.user;
			res.locals.order = data;
			res.locals.has_login = true;
			res.locals.token_crt = token_withdraw;
			res.render('account/offers-sell');
		}
		else
		{
			res.redirect('/')
		}
	})	
}


var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(parseFloat(data.balance.vnd_wallet.available) - parseFloat(data.balance.vnd_wallet.available_lock)),
			name === 'BTC' && callback(parseFloat(data.balance.btc_wallet.available) - parseFloat(data.balance.btc_wallet.available_lock)),
			name === 'STC' && callback(parseFloat(data.balance.stc_wallet.available) - parseFloat(data.balance.stc_wallet.available_lock)) 
		) : callback (balance) 
	})
}
var get_balance_lock =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(parseFloat(data.balance.vnd_wallet.available_lock)),
			name === 'BTC' && callback(parseFloat(data.balance.btc_wallet.available_lock)),
			name === 'STC' && callback(parseFloat(data.balance.stc_wallet.available_lock)) 
		) : callback (balance) 
	})
}
var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.btc_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'VND') obj =  {'balance.vnd_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'STC') obj = {'balance.stc_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var update_balace_lock = function(name , new_ast_balance,user_id,callback){
	
	var obj = null;
	if (name === 'BTC') obj =  { 'balance.btc_wallet.available_lock': parseFloat(new_ast_balance) }
	if (name === 'VND') obj =  {'balance.vnd_wallet.available_lock' : parseFloat(new_ast_balance)};
	if (name === 'STC') obj = {'balance.stc_wallet.available_lock': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var newMarketHistory = function(user_id_buy,user_id_sell,id_order, MarketName,price,quantity,total,type,code,username_buy,username_sell){
	var today = moment();
	return new MarketHistory({
		"user_id_buy" : user_id_buy,
		"user_id_sell" : user_id_sell,
		"id_order" : id_order,
		"MarketName" : MarketName,
		"price" : price,
		"quantity" : quantity,
		"total" : total,
		"date" : moment(today).format(),
		"date_finish" : moment(today.add(15,'m')).format(),
		"status" : 0,
		"type" : type,
		"code" : code,
		"username_buy" : username_buy,
		"username_sell" : username_sell
	})
}

function SubmitBuy(req,res){
	if (req.body.token_crt == req.session.token_crt)
	{
		OrderSell.findOne({'$and' : [{'_id' : req.body._id},{'status' : 0}]},(err,data)=>{
			if (!err && data)
			{
				var price = data.price;
				var MarketExchange = data.MarketName;
				var min_amount = data.min_amount;
				var max_amount = data.max_amount;
				var token_crt = req.body.token_crt;
				var id_order = req.body._id;
				var user = req.user;
				var amount_buy = req.body.amount;
				if (parseFloat(amount_buy) < parseFloat(min_amount) /100000000)
				{
					return res.status(401).send({ message: 'Lượng STC tối thiểu là '+(parseFloat(min_amount) /100000000).toFixed(8)+' STC' });
				}
				if (parseFloat(amount_buy) > parseFloat(max_amount) /100000000)
				{
					return res.status(401).send({ message: 'Lượng STC tối đa  là '+(parseFloat(max_amount) /100000000).toFixed(8)+' STC' });
				}

				get_balance('VND',user._id,function(ast_balance){
					if (parseFloat(ast_balance) < (parseFloat(amount_buy)*parseFloat(price))) 
					{
						return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
					}
					else
					{
						get_balance_lock('VND',user._id,function(balance_lock)
						{
							var new_balance_lock = parseFloat(balance_lock) + (parseFloat(amount_buy)*parseFloat(price));
							update_balace_lock('VND',new_balance_lock,user._id,function(cb){
								var date = new Date();
								var code = date.getTime();
								newMarketHistory(
									user._id,
									data.user_id, 
									data._id,
									'VND-STC',
									data.price,
									parseFloat(req.body.amount)*100000000,
									parseFloat(data.price) * parseFloat(req.body.amount), 
									'Buy',
									code,
									user.displayName,
									data.username
								).save(( err, result)=>{
									req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
									setTimeout(function() {
										MarketHistory.update({'_id' : result._id},{'$set' : {'status' : 8}},function(errs,result){
											get_balance_lock('VND',user._id,function(balance_lock)
											{
												var new_balance_lock = parseFloat(balance_lock) - (parseFloat(amount_buy)*parseFloat(price));
												update_balace_lock('VND',new_balance_lock,user._id,function(cb){	
												})
											})
										})
									}, 898500); // 15 phut tu dong cancel giao dich
									res.status(200).send({ _id: result._id});	
								})
							})
						})		
					}
				})		
			}
			else
			{
				return res.status(500).send({ message: 'Lỗi trang' });
			}
		})	
	}
	else
	{
		return res.status(500).send({ message: 'Lỗi trang' });
	}	
}

function SubmitSell(req,res){
	if (req.body.token_crt == req.session.token_crt)
	{
		OrderBuy.findOne({'$and' : [{'_id' : req.body._id},{'status' : 0}]},(err,data)=>{
			if (!err && data)
			{
				var price = data.price;
				var MarketExchange = data.MarketName;
				var min_amount = data.min_amount;
				var max_amount = data.max_amount;
				var token_crt = req.body.token_crt;
				var id_order = req.body._id;
				var user = req.user;
				var amount_sell = req.body.amount;
				if (parseFloat(amount_sell) < parseFloat(min_amount) /100000000)
				{
					return res.status(401).send({ message: 'Lượng STC tối thiểu là '+(parseFloat(min_amount) /100000000).toFixed(8)+' STC' });
				}
				if (parseFloat(amount_sell) > parseFloat(max_amount) /100000000)
				{
					return res.status(401).send({ message: 'Lượng STC tối đa  là '+(parseFloat(max_amount) /100000000).toFixed(8)+' STC' });
				}

				get_balance('STC',user._id,function(ast_balance){
					if (parseFloat(ast_balance) < parseFloat(amount_sell)) 
					{
						return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
					}
					else
					{
						get_balance_lock('STC',user._id,function(balance_lock)
						{
							var new_balance_lock = parseFloat(balance_lock) + (parseFloat(amount_sell)*100000000);
							update_balace_lock('STC',new_balance_lock,user._id,function(cb){
								var date = new Date();
								var code = date.getTime();
								newMarketHistory(
									data.user_id, 
									user._id,
									data._id,
									'VND-STC',
									data.price,
									parseFloat(req.body.amount)*100000000,
									parseFloat(data.price) * parseFloat(req.body.amount), 
									'Sell',
									code,
									data.username,
									user.displayName
								).save(( err, result)=>{
									req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
									setTimeout(function() {
										MarketHistory.update({'_id' : result._id},{'$set' : {'status' : 8}},function(errs,result){
											get_balance_lock('STC',user._id,function(balance_lock)
											{
												var new_balance_lock = parseFloat(balance_lock) - (parseFloat(amount_sell)*100000000);
												update_balace_lock('STC',new_balance_lock,user._id,function(cb){	
												})
											})
										})
									}, 898500); // 15 phut tu dong cancel giao dich
									res.status(200).send({ _id: result._id});	
								})
							})
						})		
					}
				})		
			}
			else
			{
				return res.status(500).send({ message: 'Lỗi trang' });
			}
		})	
	}
	else
	{
		return res.status(500).send({ message: 'Lỗi trang' });
	}	
}

function SubmitBuyNow(req,res){
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			var price = data.price;
			var MarketExchange = data.MarketName;
			var min_amount = data.min_amount;
			var max_amount = data.max_amount;
			var id_order = req.params.id_order;
			var user = req.user;
			var amount_buy = parseFloat(req.params.amount);
			if (parseFloat(amount_buy) < parseFloat(min_amount) /100000000)
			{
				return res.redirect('/quick#error-minamount');
			}
			if (parseFloat(amount_buy) > parseFloat(max_amount) /100000000)
			{
				return res.redirect('/quick#error-maxamount');
			}

			get_balance('VND',user._id,function(ast_balance){
				if (parseFloat(ast_balance) < (parseFloat(amount_buy)*parseFloat(price))) 
				{
					return res.redirect('/quick#error-balance');
				}
				else
				{
					get_balance_lock('VND',user._id,function(balance_lock)
					{
						var new_balance_lock = parseFloat(balance_lock) + (parseFloat(amount_buy)*parseFloat(price));
						update_balace_lock('VND',new_balance_lock,user._id,function(cb){
							var date = new Date();
							var code = date.getTime();
							newMarketHistory(
								user._id,
								data.user_id, 
								data._id,
								'VND-STC',
								data.price,
								parseFloat(amount_buy)*100000000,
								parseFloat(data.price) * parseFloat(amount_buy), 
								'Buy',
								code,
								user.displayName,
								data.username
							).save(( err, result)=>{
								setTimeout(function() {
									MarketHistory.update({'_id' : result._id},{'$set' : {'status' : 8}},function(errs,result){
										get_balance_lock('VND',user._id,function(balance_lock)
										{
											var new_balance_lock = parseFloat(balance_lock) - (parseFloat(amount_buy)*parseFloat(price));
											update_balace_lock('VND',new_balance_lock,user._id,function(cb){	
											})
										})
									})
								}, 898500); // 15 phut tu dong cancel giao dich
								
								return res.redirect('/trades-buy/'+result._id);
								
							})
						})
					})		
				}
			})		
		}
		else
		{
			return res.redirect('/quick#error-order');
		}
	})	
}

function SubmitSellNow(req,res){
	
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			var price = data.price;
			var MarketExchange = data.MarketName;
			var min_amount = data.min_amount;
			var max_amount = data.max_amount;
			var id_order = req.params.id_order
			var user = req.user;
			var amount_sell = parseFloat(req.params.amount);
			if (parseFloat(amount_sell) < parseFloat(min_amount) /100000000)
			{
				return res.redirect('/quick#error-minamount');
			}
			if (parseFloat(amount_sell) > parseFloat(max_amount) /100000000)
			{
				return res.redirect('/quick#error-maxamount');
			}

			get_balance('STC',user._id,function(ast_balance){
				if (parseFloat(ast_balance) < parseFloat(amount_sell)) 
				{
					return res.redirect('/quick#error-balance');
				}
				else
				{
					get_balance_lock('STC',user._id,function(balance_lock)
					{
						var new_balance_lock = parseFloat(balance_lock) + (parseFloat(amount_sell)*100000000);
						update_balace_lock('STC',new_balance_lock,user._id,function(cb){
							var date = new Date();
							var code = date.getTime();
							newMarketHistory(
								data.user_id, 
								user._id,
								data._id,
								'VND-STC',
								data.price,
								parseFloat(amount_sell)*100000000,
								parseFloat(data.price) * parseFloat(amount_sell), 
								'Sell',
								code,
								data.username,
								user.displayName
							).save(( err, result)=>{
								setTimeout(function() {
									MarketHistory.update({'_id' : result._id},{'$set' : {'status' : 8}},function(errs,result){
										get_balance_lock('STC',user._id,function(balance_lock)
										{
											var new_balance_lock = parseFloat(balance_lock) - (parseFloat(amount_sell)*100000000);
											update_balace_lock('STC',new_balance_lock,user._id,function(cb){	
											})
										})
									})
								}, 898500); // 15 phut tu dong cancel giao dich
								return res.redirect('/trades-sell/'+result._id);
							})
						})
					})		
				}
			})		
		}
		else
		{
			return res.redirect('/quick#error-order');
		}
	})	
	
}

module.exports = {
	TempalteOffersBuy,
	SubmitBuy,
	TempalteOffersSell,
	SubmitSell,
	SubmitBuyNow,
	SubmitSellNow
}