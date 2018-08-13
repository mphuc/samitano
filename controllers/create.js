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

const BTGclient = new bitcoin.Client({
	host: config.BTG.host,
	port: config.BTG.port,
	user: config.BTG.user,
	pass: config.BTG.pass,
	timeout: config.BTG.timeout
});

function TempalteCreate(req,res){
	var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
	req.session.token_crt = token_withdraw;	
	res.locals.title = 'Tạo quảng cáo mới';
	res.locals.menu = 'create';
	res.locals.user = req.user;
	res.locals.token_crt = token_withdraw;
	res.locals.has_login = true;
	res.render('account/create');	
}
function TempalteCreateBuyFinish(req,res){
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]} ]},(err,data)=>{
		if (!err && data)
		{
			res.locals.title = 'Giao dịch mua Santacoin';
			res.locals.menu = 'create';
			res.locals.user = req.user;
			res.locals.order = data;
			res.locals.has_login = true;
			res.render('account/create-buy-finish');
		}
		else
		{
			res.redirect('/')
		}
	})	
}

function TempalteCreateSellFinish(req,res){
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]} ]},(err,data)=>{
		if (!err && data)
		{
			res.locals.title = 'Giao dịch bán Santacoin';
			res.locals.menu = 'create';
			res.locals.user = req.user;
			res.locals.order = data;
			res.locals.has_login = true;
			res.render('account/create-sell-finish');
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
var newOrderBuy = function(user_id, MarketName,price,min_amount, max_amount,username,balance_lock){
	var today = moment();
	return new OrderBuy({
		"user_id" : user_id,
		"MarketName" : MarketName,
		"price" : parseFloat(price),
		"min_amount" : parseFloat(min_amount),
		"max_amount" : parseFloat(max_amount),
		"date" : moment(today).format(),
		"status" : 0,
		"username" :username,
		"balance_lock" : parseFloat(balance_lock)
	})
}	

var newOrderSell = function(user_id, MarketName,price,min_amount, max_amount,username,balance_lock){
	var today = moment();
	return new OrderSell({
		"user_id" : user_id,
		"MarketName" : MarketName,
		"price" : parseFloat(price),
		"min_amount" : parseFloat(min_amount),
		"max_amount" : parseFloat(max_amount),
		"date" : moment(today).format(),
		"status" : 0,
		"username" :username,
		"balance_lock" : parseFloat(balance_lock)
	})
}	
function CreateBuy (req,res){
	var price = req.body.price;
	var MarketExchange = req.body.MarketName;
	var min_amount = req.body.min_amount;
	var max_amount = req.body.max_amount;
	var token_crt = req.body.token_crt;
	var user = req.user;
	if (req.body.token_crt == req.session.token_crt)
	{
		if ( !price || isNaN(price) || price < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập giá tiền mua STC' }); 
		}
		if ( !min_amount || isNaN(min_amount) || min_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối thiểu mua STC' }); 
		}
		if ( !max_amount || isNaN(max_amount) || max_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối đa mua STC' }); 
		}
		get_balance('VND',user._id,function(ast_balance){
			if (parseFloat(ast_balance) < (parseFloat(max_amount)*parseFloat(price))*100000000) 
			{
				return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
			}
			else
			{
				req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
				
				newOrderBuy(user._id, MarketExchange,price*100000000,min_amount*100000000,max_amount*100000000,user.displayName,max_amount*price*100000000).save(( err, order_create)=>{
					err ? res.status(401).send({error: 'Error'}) : (
						get_balance_lock(MarketExchange.split('-')[0],user._id,function(balance_lock)
						{
							var new_balance_lock = parseFloat(balance_lock) + ((parseFloat(max_amount) * parseFloat(price))*100000000);
							update_balace_lock(MarketExchange.split('-')[0],new_balance_lock,user._id,function(cb){
								res.status(200).send({ _id: order_create._id});	
							})
						})
					)
				})
			}
		})
	}
	else
	{
		return res.status(500).send({ message: 'Lỗi trang' });
	}
}

function OrderBuyPause(req,res){
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]} ,(err,data)=>{
		if (!err && data)
		{
			OrderBuy.update({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]},{'$set' : {'status' : 1}},function(errs,result){
				res.redirect('/offers/create-buy/'+req.params.id_order)
			})
		}
		else
		{
			res.redirect('/offers/create-buy/'+req.params.id_order)
		}
	})	
}

function OrderBuyStart(req,res){
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]} ,(err,data)=>{
		if (!err && data)
		{
			OrderBuy.update({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]},{'$set' : {'status' : 0}},function(errs,result){
				res.redirect('/offers/create-buy/'+req.params.id_order)
			})
		}
		else
		{
			res.redirect('/offers/create-buy/'+req.params.id_order)
		}
	})	
}

function TempalteEditBuyOrder(req,res){
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]} ]} ,(err,data)=>{
		if (!err && data)
		{
			var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			req.session.token_crt = token_withdraw;	
			res.locals.title = 'Sửa quảng cáo';
			res.locals.menu = 'edit';
			res.locals.user = req.user;
			res.locals.token_crt = token_withdraw;
			res.locals.order = data;
			res.locals.has_login = true;
			res.render('account/edit-buy');
		}	
		else
		{
			res.redirect('/offers/create-buy/'+req.params.id_order)
		}
	})	
}
function EditBuySubmit (req,res){
	var price = req.body.price;
	var MarketExchange = req.body.MarketName;
	var min_amount = req.body.min_amount;
	var max_amount = req.body.max_amount;
	var token_crt = req.body.token_crt;
	var id_order = req.body.id_order;
	var user = req.user;
	if (req.body.token_crt == req.session.token_crt)
	{
		if ( !price || isNaN(price) || price < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập giá tiền mua STC' }); 
		}
		if ( !min_amount || isNaN(min_amount) || min_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối thiểu mua STC' }); 
		}
		if ( !max_amount || isNaN(max_amount) || max_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối đa mua STC' }); 
		}
		OrderBuy.findOne({'$and' : [{'_id' : id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]}]} ,(err,order)=>{
			if (!err && order)
			{
				var balance_lock_old = parseFloat(order.balance_lock);
				get_balance('VND',user._id,function(ast_balance){
					
					if (parseFloat(ast_balance) + parseFloat(balance_lock_old) < (parseFloat(max_amount)*parseFloat(price))*100000000) 
					{
						return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
					}
					else
					{
						req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
						OrderBuy.update({'$and' : [{'_id' : id_order},{'user_id' : req.user._id} ]},
							{'$set' : {
								'min_amount' : min_amount*100000000,
								'price' : price*100000000,
								'max_amount' : max_amount*100000000,
								'balance_lock' : price*max_amount*100000000}},function(errss,resssss){

							get_balance_lock(MarketExchange.split('-')[0],user._id,function(balance_lock)
							{
								var new_balance_lock = parseFloat(balance_lock) + ((parseFloat(max_amount) * parseFloat(price))*100000000) - parseFloat(balance_lock_old);
								update_balace_lock(MarketExchange.split('-')[0],new_balance_lock,user._id,function(cb){
									res.status(200).send({ _id: id_order});
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
function OrderBuyRemove(req,res){
	var user = req.user;
	OrderBuy.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]} ]} ,(err,order)=>{
		if (!err && order)
		{
			OrderBuy.update({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]},{'$set' : {'status' : 8}},function(errss,resssss){
				get_balance_lock('VND',user._id,function(balance_lock)
				{
					var new_balance_lock = parseFloat(balance_lock) - parseFloat(order.balance_lock);
					update_balace_lock('VND',new_balance_lock,user._id,function(cb){
						res.redirect('/dashboard#dashboard3');
					})
				})
			})
		}
		else
		{
			res.redirect('/offers/create-buy/'+req.params.id_order)
		}
	})	
}


function CreateSell (req,res){
	var price = req.body.price;
	var MarketExchange = req.body.MarketName;
	var min_amount = req.body.min_amount;
	var max_amount = req.body.max_amount;
	var token_crt = req.body.token_crt;
	var user = req.user;
	if (req.body.token_crt == req.session.token_crt)
	{
		if ( !price || isNaN(price) || price < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập giá tiền bán STC' }); 
		}
		if ( !min_amount || isNaN(min_amount) || min_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối thiểu bán STC' }); 
		}
		if ( !max_amount || isNaN(max_amount) || max_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối đa bán STC' }); 
		}
		get_balance('STC',user._id,function(ast_balance){
			if (parseFloat(ast_balance) < parseFloat(max_amount)*100000000) 
			{
				return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
			}
			else
			{
				req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
				
				newOrderSell(user._id, MarketExchange,price*100000000,min_amount*100000000,max_amount*100000000,user.displayName,max_amount*100000000).save(( err, order_create)=>{
					err ? res.status(401).send({error: 'Error'}) : (
						get_balance_lock(MarketExchange.split('-')[1],user._id,function(balance_lock)
						{
							var new_balance_lock = parseFloat(balance_lock) + (parseFloat(max_amount)*100000000);
							update_balace_lock(MarketExchange.split('-')[1],new_balance_lock,user._id,function(cb){
								res.status(200).send({ _id: order_create._id});	
							})
						})
					)
				})
			}
		})
	}
	else
	{
		return res.status(500).send({ message: 'Lỗi trang' });
	}
}
function OrderSellPause(req,res){
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]} ,(err,data)=>{
		if (!err && data)
		{
			OrderSell.update({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]},{'$set' : {'status' : 1}},function(errs,result){
				res.redirect('/offers/create-sell/'+req.params.id_order)
			})
		}
		else
		{
			res.redirect('/offers/create-sell/'+req.params.id_order)
		}
	})	
}
function OrderSellStart(req,res){
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]} ,(err,data)=>{
		if (!err && data)
		{
			OrderSell.update({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]},{'$set' : {'status' : 0}},function(errs,result){
				res.redirect('/offers/create-sell/'+req.params.id_order)
			})
		}
		else
		{
			res.redirect('/offers/create-sell/'+req.params.id_order)
		}
	})	
}

function OrderSellRemove(req,res){
	var user = req.user;
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]} ]} ,(err,order)=>{
		if (!err && order)
		{
			OrderSell.update({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id} ]},{'$set' : {'status' : 8}},function(errss,resssss){
				get_balance_lock('STC',user._id,function(balance_lock)
				{
					var new_balance_lock = parseFloat(balance_lock) - parseFloat(order.balance_lock);
					update_balace_lock('STC',new_balance_lock,user._id,function(cb){
						res.redirect('/dashboard#dashboard3');
					})
				})
			})
		}
		else
		{
			res.redirect('/offers/create-sell/'+req.params.id_order)
		}
	})	
}

function TempalteEditSellOrder(req,res){
	OrderSell.findOne({'$and' : [{'_id' : req.params.id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]} ]} ,(err,data)=>{
		if (!err && data)
		{
			var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			req.session.token_crt = token_withdraw;	
			res.locals.title = 'Sửa quảng cáo';
			res.locals.menu = 'edit';
			res.locals.user = req.user;
			res.locals.token_crt = token_withdraw;
			res.locals.order = data;
			res.locals.has_login = true;
			res.render('account/edit-sell');
		}	
		else
		{
			res.redirect('/offers/create-sell/'+req.params.id_order)
		}
	})	
}

function EditSellSubmit (req,res){
	var price = req.body.price;
	var MarketExchange = req.body.MarketName;
	var min_amount = req.body.min_amount;
	var max_amount = req.body.max_amount;
	var token_crt = req.body.token_crt;
	var id_order = req.body.id_order;
	var user = req.user;
	if (req.body.token_crt == req.session.token_crt)
	{
		if ( !price || isNaN(price) || price < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập giá tiền bán STC' }); 
		}
		if ( !min_amount || isNaN(min_amount) || min_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối thiểu bán STC' }); 
		}
		if ( !max_amount || isNaN(max_amount) || max_amount < 0)
		{
			return res.status(500).send({ message: 'Vui lòng nhập số lượng tối đa bán STC' }); 
		}
		OrderSell.findOne({'$and' : [{'_id' : id_order},{'user_id' : req.user._id},{'$or' : [{'status' : 0},{'status' : 1}]}]} ,(err,order)=>{
			if (!err && order)
			{
				var balance_lock_old = parseFloat(order.balance_lock);
				get_balance('STC',user._id,function(ast_balance){
					
					if (parseFloat(ast_balance) + parseFloat(balance_lock_old) < parseFloat(max_amount)*100000000) 
					{
						return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
					}
					else
					{
						req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
						OrderSell.update({'$and' : [{'_id' : id_order},{'user_id' : req.user._id} ]},
							{'$set' : {
								'min_amount' : min_amount*100000000,
								'price' : price*100000000,
								'max_amount' : max_amount*100000000,
								'balance_lock' : max_amount*100000000}},function(errss,resssss){

							get_balance_lock(MarketExchange.split('-')[1],user._id,function(balance_lock)
							{
								var new_balance_lock = parseFloat(balance_lock) + (parseFloat(max_amount)*100000000) - parseFloat(balance_lock_old);
								update_balace_lock(MarketExchange.split('-')[1],new_balance_lock,user._id,function(cb){
									res.status(200).send({ _id: id_order});
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
module.exports = {
	TempalteCreate,
	CreateBuy,
	TempalteCreateBuyFinish,
	OrderBuyPause,
	OrderBuyStart,
	TempalteEditBuyOrder,
	EditBuySubmit,
	OrderBuyRemove,
	CreateSell,
	TempalteCreateSellFinish,
	OrderSellPause,
	OrderSellStart,
	OrderSellRemove,
	TempalteEditSellOrder,
	EditSellSubmit
}