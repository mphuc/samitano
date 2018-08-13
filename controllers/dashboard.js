'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const Ticker = require('../models/ticker');
const Order = require('../models/order');
const OrderBuy = require('../models/exchange/orderbuy').module();
const OrderSell = require('../models/exchange/ordersell').module();
const MarketHistory = require('../models/exchange/markethistory').module();
function IndexOn(req,res){

	if (req.query.ref)
	{
		res.cookie('sponsor', req.query.ref);
	}
	

	if (req.session.userId) {
		User.findById(req.session.userId, function(err, user) {
			res.locals.title = 'Mua bán Santacoin nhanh chóng và an toàn'
			res.locals.menu = 'dashboard'
			res.locals.user = user
			res.locals.has_login = true
			res.render('account/dashboard');
	    });
	}
	else
	{
		res.locals.title = 'Mua bán Santacoin nhanh chóng và an toàn'
		res.locals.menu = 'dashboard'
		res.locals.has_login = false
		res.render('account/dashboard');
	}
}

function get_price_stc(req,res)
{
	var price_sell = 0;
	var price_buy = 0;
	OrderSell.find({'status' : 0},function(errs,res_sell){
		if (!errs && res_sell.length > 0)
		{
			price_sell = parseFloat(res_sell[0].price)/100000000;

			OrderBuy.find({'status' : 0},function(errss,res_buy){
				if (!errss && res_buy.length > 0)
				{
					price_buy = parseFloat(res_buy[0].price)/100000000;
					return res.status(200).send({ 'buy': format_vnd(price_buy),'sell' : format_vnd(price_sell) });
				}
				else
				{
					return res.status(200).send({ 'buy': 0,'sell' : format_vnd(price_sell) });
				}
			}).sort({price: 1}).limit(1);
		}
		else
		{
			OrderBuy.find({'status' : 0},function(errss,res_buy){
				if (!errss && res_buy.length > 0)
				{
					price_buy = parseFloat(res_buy[0].price)/100000000;
					return res.status(200).send({ 'buy': format_vnd(price_buy),'sell' : 0 });
				}
				else
				{
					return res.status(200).send({ 'buy': 0,'sell' : 0 });
				}
			}).sort({price: 1}).limit(1);
		}
	}).sort({price: 1}).limit(1);
}
function format_vnd(amount) {

      var nStr = parseFloat(amount);
      nStr += '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
}
function DashboardTemplate(req,res){
	res.locals.title = 'Giao dịch của bạn'
	res.locals.menu = 'dashboards'
	res.locals.has_login = true
	res.locals.user = req.user
	res.render('account/history');
	
}
function Wallet_STC(req,res){
	res.locals.title = 'Ví Santacoin Samitano'
	res.locals.menu = 'wallet-stc'
	res.locals.has_login = false
	res.locals.user = req.user
	res.render('account/wallet-stc');
	
}
function ReferralProgramTemplate(req,res){
	res.locals.title = 'Chương trình giới thiệu'
	res.locals.menu = 'Referral'
	res.locals.has_login = true
	res.locals.user = req.user
	res.render('account/referral_program');
	
}

function LoadOrder_buyAll(req,res){

	OrderBuy.find({ 'status': 0 },(err,result)=>{
		return res.status(200).send({result: result});
	});
}

function LoadOrder_sellAll(req,res){
	OrderSell.find({ 'status': 0 },(err,result)=>{
		return res.status(200).send({result: result});
	});
}

function LoadOrder_buyNOW(req,res){
	if (req.query.amount)
	{
		OrderSell.find({'$and' : [{'max_amount': {$gte: parseFloat(req.query.amount)*100000000} },{ 'status': 0 }]} ,(err,result)=>{
			return res.status(200).send({result: result});
		});
	}
	else
	{
		return res.status(200).send({result: []});
	}
		
}
function LoadOrder_sellNOW(req,res){
	if (req.query.amount)
	{
		OrderBuy.find({'$and' : [{'max_amount': {$gte: parseFloat(req.query.amount)*100000000} },{ 'status': 0 }]},(err,result)=>{
			return res.status(200).send({result: result});
		});
	}
	else
	{
		return res.status(200).send({result: []});
	}
}
function LoadOrderOpen(req,res){
	MarketHistory.find({'$and' : [{$or: [{'user_id_buy' : req.user._id},{'user_id_sell' : req.user._id}]},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			return res.status(200).send({result: data});
		}
		else
		{
			return res.status(200).send({result: []});
		}
	})
}
function LoadOrderClose(req,res){
	MarketHistory.find({'$and' : [{$or: [{'user_id_buy' : req.user._id},{'user_id_sell' : req.user._id}]},{$or: [{'status' : 2},{'status' : 8}]}]},(err,data)=>{
		if (!err && data)
		{
			return res.status(200).send({result: data});
		}
		else
		{
			return res.status(200).send({result: []});
		}
	})
}

function LoadOrderBuyUser(req,res){
	OrderBuy.find({'$and' : [{$or: [{ 'status': 0 },{ 'status': 1 }]},{ 'user_id': req.user._id }]},(err,result)=>{
		return res.status(200).send({result: result});
	});
}
function LoadOrderSellUser(req,res){
	OrderSell.find({'$and' : [{$or: [{ 'status': 0 },{ 'status': 1 }]},{ 'user_id': req.user._id }]},(err,result)=>{
		return res.status(200).send({result: result});
	});
}
function LoadReffrallUser(req,res){
	User.find({ 'p_node': req.user._id },{'displayName' : 1,'level' : 1,'signupDate' :1},(err,result)=>{
		return res.status(200).send({result: result});
	});
}

module.exports = {
	IndexOn,
	DashboardTemplate,
	LoadOrder_buyAll,
	LoadOrder_sellAll,
	ReferralProgramTemplate,
	LoadOrder_buyNOW,
	LoadOrder_sellNOW,
	LoadOrderOpen,
	LoadOrderClose,
	LoadOrderBuyUser,
	LoadOrderSellUser,
	LoadReffrallUser,
	Wallet_STC,
	get_price_stc
}