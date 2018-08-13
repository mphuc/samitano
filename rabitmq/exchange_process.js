'use strict'
const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('../config');
const amqp = require('amqplib/callback_api');
const sendRabimq = require('../rabbit_comfim');
const request = require('request');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const urlSlug = require('url-slug');
var sendpulse = require("sendpulse-api");
const OrderBuy = require('../models/exchange/orderbuy').module();
const OrderSell = require('../models/exchange/ordersell').module();
const MarketHistory = require('../models/exchange/markethistory').module();
var forEach = require('async-foreach').forEach;

var info = {
    socket: null,
    io: null,
    get sockets() {
        return {
        	socket : this.socket,
        	io : this.io
        };
    },
    set sockets (infoSocket) {
        this.socket = infoSocket[0] || null;
        this.io = infoSocket[1] || null;
    }
}

var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'BTC' && callback(data.balance.bitcoin_wallet.available),
			name === 'BCH' && callback(data.balance.bitcoincash_wallet.available),
			name === 'BCC' && callback(data.balance.bitconnect_wallet.available),
			name === 'LTC' && callback(data.balance.litecoin_wallet.available),
			name === 'BBL' && callback(data.balance.coin_wallet.available),
			name === 'DASH' && callback(data.balance.dashcoin_wallet.available),
			name === 'XVG' && callback(data.balance.verge_wallet.available),
			name === 'BTG' && callback(data.balance.bitcoingold_wallet.available),
			name === 'XZC' && callback(data.balance.zcoin_wallet.available)
		) : callback (balance) 
	})
}
var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'BCH') obj =  {'balance.bitcoincash_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'BCC') obj = {'balance.bitconnect_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'LTC') obj = {'balance.litecoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BBL') obj = {'balance.coin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'DASH') obj = {'balance.dashcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XVG') obj = {'balance.verge_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BTG') obj = {'balance.bitcoingold_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XZC') obj = {'balance.zcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'ETH') obj = {'balance.ethereum_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}


var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'BCH') obj =  {'balance.bitcoincash_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'BCC') obj = {'balance.bitconnect_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'LTC') obj = {'balance.litecoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BBL') obj = {'balance.coin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'DASH') obj = {'balance.dashcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XVG') obj = {'balance.verge_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BTG') obj = {'balance.bitcoingold_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XZC') obj = {'balance.zcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'ETH') obj = {'balance.ethereum_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'BTC' && callback(data.balance.bitcoin_wallet.available),
			name === 'BCH' && callback(data.balance.bitcoincash_wallet.available),
			name === 'BCC' && callback(data.balance.bitconnect_wallet.available),
			name === 'LTC' && callback(data.balance.litecoin_wallet.available),
			name === 'BBL' && callback(data.balance.coin_wallet.available),
			name === 'DASH' && callback(data.balance.dashcoin_wallet.available),
			name === 'XVG' && callback(data.balance.verge_wallet.available),
			name === 'BTG' && callback(data.balance.bitcoingold_wallet.available),
			name === 'XZC' && callback(data.balance.zcoin_wallet.available),
			name === 'ETH' && callback(data.balance.ethereum_wallet.available)
		) : callback (balance) 
	})
}

function process_matching_buy(string_receiverabit , callback){

	console.log(string_receiverabit);

	/*process_cancel_order(string_receiverabit, function(cb){
		cb ? callback(true) : callback(false)
	});*/
}

return module.exports = {
	infoSocket : function(socket, io){
		info.sockets = [socket, io];
	},
	module : function(){
		return {
			process_matching_buy
		}
	}
}
