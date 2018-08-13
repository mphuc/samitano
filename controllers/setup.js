'use strict'

const mongoose = require('mongoose');
const request = require('request');
const Ticker = require('../models/ticker');
const IcoSum = require('../models/icosum');
const Volume = require('../models/exchange/volume').module();
function setupTicker(req,res){
	let newTicker = new Ticker();
	newTicker.coin = {'usd' : 1, 'btc' : 1};
	newTicker.btc= {'usd' : 1, 'btc' : 1}
	newTicker.bch= {'usd' : 1, 'btc' : 1}
	newTicker.btg= {'usd' : 1, 'btc' : 1}
	newTicker.ltc= {'usd' : 1, 'btc' : 1}
	newTicker.dash= {'usd' : 1, 'btc' : 1}
	newTicker.bcc= {'usd' : 1, 'btc' : 1}
	newTicker.xvg= {'usd' : 1, 'btc' : 1}
	newTicker.eth= {'usd' : 1, 'btc' : 1}
	newTicker.btc_usd = 0
	newTicker.sva_btc = 0
	newTicker.sva_usd = 0
        
	newTicker.save((err, investStored)=>{
		res.status(200).send(investStored);
	});
}

function setupIcoSum(req,res){
	let newIcoSum = new IcoSum();
	newIcoSum.total = '0';
	newIcoSum.total_today = '0';
	newIcoSum.status = '0';
	newIcoSum.save((err, Ico)=>{
		res.status(200).send(Ico);
	});
}
function setupvolume(req,res){
	let newVolume = new Volume();
	newVolume.MarketName = 'BTC-SVA';
	newVolume.last = '0';
	newVolume.bid = '0';
	newVolume.ask = '0';
	newVolume.hight = '0';
	newVolume.low = '0';
	newVolume.volume = '0';
	
	newVolume.last_last = '0';
	newVolume.bid_last = '0';
	newVolume.ask_last = '0';
	newVolume.hight_last = '0';
	newVolume.low_last = '0';
	newVolume.volume_last = '0';
	newVolume.date_added = new Date();
	newVolume.save((err, Ico)=>{
		res.status(200).send(Ico);
	});
}
function Setup(req,res){
	//res.status(404).send('Error');
	/*IcoSum.remove({}, function(err, reply) {
		setupIcoSum(req,res);
	});*/
	Volume.remove({}, function(err, reply) {
		setupvolume(req,res);
	});
	Ticker.remove({}, function(err, reply) {
		setupTicker(req,res);
	});
	
}

module.exports = {
	Setup
}