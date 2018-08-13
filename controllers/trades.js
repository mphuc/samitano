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
var get_balance_no_lock =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(parseFloat(data.balance.vnd_wallet.available) ),
			name === 'BTC' && callback(parseFloat(data.balance.btc_wallet.available) ),
			name === 'STC' && callback(parseFloat(data.balance.stc_wallet.available) ) 
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
function getTimeInterval(startTime, endTime){
        return moment(moment(startTime,"mm:ss").diff(moment(endTime,"mm:ss"))).format("mm:ss"); 
}
function TempalteTradesBuy(req,res){
	MarketHistory.findOne({'$and' : [{'_id' : req.params.id_trades}]},(err,data)=>{
		if (!err && data)
		{
			var today = moment();
			var date_finish = moment(data.date_finish).format('mm:ss');
			var today = moment(today).format('mm:ss');
			var subdate = getTimeInterval(date_finish,today);

			var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			req.session.token_crt = token_withdraw;	
			res.locals.title = 'Khởi tạo giao dịch';
			res.locals.menu = 'trades';
			res.locals.user = req.user;
			res.locals.trades = data;
			res.locals.has_login = true;
			res.locals.subdate = subdate;
			res.locals.token_crt = token_withdraw;
			res.render('account/trades-buy');
		}
		else
		{
			res.redirect('/')
		}
	})	
}

function CancelTradesBuy(req,res){
	MarketHistory.findOne({'$and' : [{'_id' : req.params.id_trades},{'user_id_buy' : req.user._id},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			MarketHistory.update({'$and' : [{'_id' : req.params.id_trades},{'user_id_buy' : req.user._id} ]},{'$set' : {'status' : 8}},function(errs,result){
				get_balance_lock('VND',req.user._id,function(balance_lock)
				{
					var new_balance_lock = parseFloat(balance_lock) - (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
					update_balace_lock('VND',new_balance_lock,req.user._id,function(cb){	
					})
				})
				res.redirect('/trades-buy/'+req.params.id_trades)
			})
		}
		else
		{
			res.redirect('/trades-buy/'+req.params.id_trades)
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

function ConfirmTradesBuy(req,res){
	MarketHistory.findOne({'$and' : [{'_id' : req.params.id_trades},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			var string_sendrabit = (req.params.id_trades).toString();
			sendRabimq.publish('','MATCHING_BUY_QWE',new Buffer(string_sendrabit)),
			res.redirect('/trades-buy/'+req.params.id_trades);
		}
		else
		{
			res.redirect('/trades-buy/'+req.params.id_trades)
		}
	})
}


function TempalteTradesSell(req,res){
	MarketHistory.findOne({'$and' : [{'_id' : req.params.id_trades}]},(err,data)=>{
		if (!err && data)
		{
			var today = moment();
			var date_finish = moment(data.date_finish).format('mm:ss');
			var today = moment(today).format('mm:ss');
			var subdate = getTimeInterval(date_finish,today);

			var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			req.session.token_crt = token_withdraw;	
			res.locals.title = 'Khởi tạo giao dịch';
			res.locals.menu = 'trades';
			res.locals.user = req.user;
			res.locals.trades = data;
			res.locals.has_login = true;
			res.locals.subdate = subdate;
			res.locals.token_crt = token_withdraw;
			res.render('account/trades-sell');
		}
		else
		{
			res.redirect('/')
		}
	})	
}

function CancelTradesSell(req,res){
	MarketHistory.findOne({'$and' : [{'_id' : req.params.id_trades},{'user_id_sell' : req.user._id},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			MarketHistory.update({'$and' : [{'_id' : req.params.id_trades},{'user_id_sell' : req.user._id} ]},{'$set' : {'status' : 8}},function(errs,result){
				get_balance_lock('STC',req.user._id,function(balance_lock)
				{
					var new_balance_lock = parseFloat(balance_lock) - (parseFloat(data.quantity));
					update_balace_lock('STC',new_balance_lock,req.user._id,function(cb){	
					})
				})
				res.redirect('/trades-sell/'+req.params.id_trades)
			})
		}
		else
		{
			res.redirect('/trades-sell/'+req.params.id_trades)
		}
	})
	
}

function ConfirmTradesSell(req,res){
	MarketHistory.findOne({'$and' : [{'_id' : req.params.id_trades},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			var string_sendrabit = (req.params.id_trades).toString();
			sendRabimq.publish('','MATCHING_SELL_QWE',new Buffer(string_sendrabit)),
			res.redirect('/trades-sell/'+req.params.id_trades);
		}
		else
		{
			res.redirect('/trades-sell/'+req.params.id_trades)
		}
	})
}

module.exports = {
	TempalteTradesBuy,
	CancelTradesBuy,
	ConfirmTradesBuy,
	TempalteTradesSell,
	CancelTradesSell,
	ConfirmTradesSell
}