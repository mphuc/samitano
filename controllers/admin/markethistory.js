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
const MarketHistory = require('../../models/exchange/markethistory').module();
var forEach = require('async-foreach').forEach;

var config = require('../../config');
const bitcoin = require('bitcoin');

const BBLclient = new bitcoin.Client({
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


function ListMarketHistory(req, res){

	MarketHistory.find({},function(err, data){
		if (!err && data.length > 0)
		{
			var data_market = [];
			forEach(data, function(value, index){
				var done = this.async();
				
				User.findById(value.user_id_buy, (err, user_buy)=>{
					
					if (user_buy)
					{
						User.findById(value.user_id_sell, (err, user_sell)=>{
							if (user_sell)
							{
								data_market.push({
									'buy' : user_buy.displayName,
									'sell' : user_sell.displayName,
									'date' : value.date,
									'price' : value.price,
									'quantity' : value.quantity,
									'total' : value.total
								});
								done();
							}
							else
							{
								done();
							}
							
						});
					}
					else
					{
						done();
					}
				});
								
				data.length - 1 === index && (
					res.render('admin/markethistory', {
						title: 'Withdraw',
						layout: 'layout_admin.hbs',
						data_market :data_market
						
					})
				)
			});
		}
	})
}



module.exports = {
	ListMarketHistory,
	
}