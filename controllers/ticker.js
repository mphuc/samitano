'use strict'

const mongoose = require('mongoose');
const Ticker = require('../models/ticker');
const request = require('request');
const IcoSum = require('../models/icosum');
const cron = require('node-cron');
const Volume = require('../models/exchange/volume').module();
cron.schedule('30 */5 * * * *', function(){
 
});



function Get_Price_BTC_USD(callback){
	request({
        url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD',
        json: true
    }, function(error, response, body) {
    	if (!body || error) {
    		return false
    	}
		var price_usd = parseFloat(body.USD);
		var price_btc = parseFloat(body.BTC);
		var price = {};
		price.usd = price_usd;
		price.btc = price_btc;
		callback(price);
	});
}
function Get_Price_ETH_USD(callback){
	request({
        url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=ETH,USD',
        json: true
    }, function(error, response, body) {
    	if (!body || error) {
    		return false
    	}
		var price_usd = parseFloat(body.USD);
		var price_btc = parseFloat(body.BTC);
		var price = {};
		price.usd = price_usd;
		price.btc = price_btc;
		
		callback(price);
	});
}

function Get_Price_COIN_BTC(callback){
	Volume.findOne({},(err,data_ticker)=>{
		callback(parseFloat(data_ticker.last)/100000000)
	});
}





function Index(){
	
	let data = {};
	
   	Get_Price_BTC_USD(function(btc){
   		if (btc)
   		{
   			data.btc_usd = btc.usd;
	   		data.btc_btc = btc.btc;
	   		Get_Price_COIN_BTC(function(coin){
	   			data.bbl_btc = coin;
	   			data.bbl_usd = (parseFloat(coin)*parseFloat(btc.usd)).toFixed(8);
   				Get_Price_ETH_USD(function(eth){
			   		if (eth)
			   		{
			   			data.eth_usd = eth.usd;
			   			data.eth_btc = parseFloat(eth.usd)/parseFloat(data.btc_usd);
			   			var data_update = {
							$set : {
								'coin.usd': data.bbl_usd,
								'coin.btc': data.bbl_btc,
								'btc.usd': data.btc_usd,
								'btc.btc': data.btc_btc,
								'eth.usd': data.eth_usd,
								'eth.btc': data.eth_btc
							}
						};
					
						Ticker.findOneAndUpdate({},data_update,(err,new_data_ticker)=>{
							return 0;
						});
			   		}
			   	});
			});	
   		} 		
   	})
}

function LoadPrice(req, res){
	Ticker.findOne({},(err,data)=>{
		Volume.findOne({},(err,data_ticker)=>{
			res.status(200).send({
				'btc_usd' : data.btc.usd,
				'coin_usd' : (parseFloat(data.btc.usd)*(parseFloat(data_ticker.last)/100000000)).toFixed(8),
				'coin_btc' : (parseFloat(data_ticker.last)/100000000).toFixed(8)
			})
		});
	})
}

module.exports = {
	Index,
	LoadPrice
}