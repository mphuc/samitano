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
function Indexs(req,res) {

	var date_serach = { $and : [{"MarketName" : 'BTC-STC'},{
	    "date": { $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))}
		}]
	};
	var btc_stc_price = {};
	btc_stc_price.percent = 0;
	Volume.findOne({'MarketName' : 'BTC-STC'},function(errs,result_volume){
		MarketHistory.find(date_serach,function(err,result_market){
			if (!err && result_market.length > 0)
			{
				var price_last_24 = result_market[0].price;
				console.log(price_last_24);
				btc_stc_price.percent = parseFloat(result_volume.last) > parseFloat(price_last_24) ? (parseFloat(result_volume.last)/parseFloat(price_last_24)).toFixed(2) : (parseFloat(price_last_24) / parseFloat(result_volume.last)).toFixed(2);
				btc_stc_price.up_down = parseFloat(result_volume.last) >= parseFloat(price_last_24) ? 'up' : 'down';
			}
			if (!errs && result_volume)
			{
				btc_stc_price.last = result_volume.last;
				btc_stc_price.hight = result_volume.hight;
				btc_stc_price.low = result_volume.low;
				btc_stc_price.volume = result_volume.volume;
				btc_stc_price.date = result_volume.date;
			}
			


			req.session.userId ? (
				ger_user(req.session.userId,function(result){
					result === null ?(
						res.locals.has_login = false,
						res.locals.menu = 'exchange_dashboard',
						//res.locals.layout = 'market.hbs',
						res.locals.change_btc_stc = btc_stc_price,
						res.locals.title = 'The Next Generation Crypto-Currency Exchange',
					 	res.render('exchange/dashboard')
					) : (
						res.locals.has_login = true,
						res.locals.menu = 'exchange_dashboard',
						//res.locals.layout = 'market.hbs',
						res.locals.change_btc_stc = btc_stc_price,
						res.locals.title = 'The Next Generation Crypto-Currency Exchange',
					 	res.render('exchange/dashboard')
					)
				})
			) : (
				res.locals.has_login = false,
				res.locals.menu = 'exchange_dashboard',
				//res.locals.layout = 'market.hbs',
				res.locals.change_btc_stc = btc_stc_price,
				res.locals.title = 'The Next Generation Crypto-Currency Exchange',
			 	res.render('exchange/dashboard')
			)
		})
	})


	
}
function ger_user(userId,callback){
	User.findOne({_id :userId},(err,result)=>{
		err || !result ? callback(null) : callback(result);
	})
}
module.exports = {
	Indexs,
	
}