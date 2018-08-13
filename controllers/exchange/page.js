'use strict'
const mongoose = require('mongoose');
const User = require('../../models/user');
const OrderBuy = require('../../models/exchange/orderbuy').module();
const OrderSell = require('../../models/exchange/ordersell').module();
const MarketHistory = require('../../models/exchange/markethistory').module();
const Chart = require('../../models/exchange/chart').module();
const Volume = require('../../models/exchange/volume').module();
const request = require('request');
const bitcoin = require('bitcoin');
const amqp = require('amqplib/callback_api');
const sendRabimq = require('../../rabbit_comfim');
const moment = require('moment');
const _ = require('lodash');
function LoadTempalateFee(req,res) {
	req.session.userId ? (
		ger_user(req.session.userId,function(result){
			result === null ?(
				res.locals.has_login = false,
				res.render('exchange/fee', {
			       title : ' Fees'
			    })
			) : (
				res.locals.has_login = true,
				res.render('exchange/fee', {
			       title : ' Fees'
			    })
			)
		})
	) : (
		res.locals.has_login = false,
		res.render('exchange/fee', {
	       title : ' Fees'
	    })
	)
}

function LoadTempalateApi(req,res) {
	req.session.userId ? (
		ger_user(req.session.userId,function(result){
			result === null ?(
				res.locals.has_login = false,
				res.render('exchange/api', {
			       title : ' Api'
			    })
			) : (
				res.locals.has_login = true,
				res.render('exchange/api', {
			       title : ' Api'
			    })
			)
		})
	) : (
		res.locals.has_login = false,
		res.render('exchange/api', {
	       title : ' Api'
	    })
	)
	
}

function ger_user(userId,callback){
	User.findOne({_id :userId},(err,result)=>{
		err || !result ? callback(null) : callback(result);
	})
}
function Api_SFCC(req,res) {
	var percent = 0;
	var MarketName = req.params.MarketName;
	Volume.findOne({'MarketName' : MarketName},(err,result)=>{

		var date_serach = { $and : [{"MarketName" : 'BTC-BBL'},{
		    "date": { $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))}
			}]
		};

		MarketHistory.find(date_serach,function(err,result_market){
			if (!err && result_market.length > 0)
			{
				var price_last_24 = result_market[result_market.length-1].price;
				percent = parseFloat(result.last) > parseFloat(price_last_24) ? parseFloat(result.last)/parseFloat(price_last_24) : parseFloat(price_last_24) / parseFloat(result.last);
			}
			return res.status(200).send({
				'status' : 'status',
				'markets' : [{
					"bid": parseFloat(result.bid)/100000000,
		            "last": parseFloat(result.last)/100000000,
		            "ask": parseFloat(result.ask)/100000000,
		            "volume24h": parseFloat(result.volume)/100000000,
		            "currency": "SFCC",
		            "marketname": "BTC-SFCC",
		            "low24h": parseFloat(result.low)/100000000,
		            "high24h": parseFloat(result.hight)/100000000,
		            "change24h": percent,
		            "basecurrency": "BTC"
				}]
			});
		});
		
		
	}); 
}

module.exports = {
	LoadTempalateFee,
	LoadTempalateApi,
	Api_SFCC
}