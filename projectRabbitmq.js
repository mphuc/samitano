'use strict'
const mongoose = require('mongoose');
const User = require('./models/user');
const service = require('./services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('./config');
const amqp = require('amqplib/callback_api');
const Deposit = require('./models/deposit');
const Withdraw = require('./models/withdraw');


var _ = require('lodash');

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

var getUser = function(id_user,callback){
	User.findById(id_user, function(err, user) {
		err || !user ? callback(null) : callback(user);
	});
}

var Create_Withdraw = function(name,user,amount,address,fee,callback){
	let newWithdraw = new Withdraw();	
	var date = new Date();
	var date = date.getTime();
	
	var today = moment();
	newWithdraw.amount = amount;
	newWithdraw.user_id = user._id;
	newWithdraw.status = 0;
	newWithdraw.username = user.displayName;
	newWithdraw.wallet = address;
	newWithdraw.txid = '';
	newWithdraw.fee = fee;
	newWithdraw.date = moment(today).format();
	newWithdraw.type = name;
	newWithdraw.code = "W"+date;
	newWithdraw.save((err, WithdrawStored)=>{
		err ? callback(false) : callback(true);
	});
}

var Create_WithdrawVND = function(user,amount,bank_name, account_number ,account_horder,fee,callback){
	var date = new Date();
	var date = date.getTime();
	let newWithdraw = new Withdraw();	
	var today = moment();
	newWithdraw.amount = amount;
	newWithdraw.user_id = user._id;
	newWithdraw.status = 0;
	newWithdraw.username = user.displayName;
	newWithdraw.namebank = bank_name;
	newWithdraw.numberbank = account_number;
	newWithdraw.horderbank = account_horder;
	newWithdraw.txid = '';
	newWithdraw.fee = fee;
	newWithdraw.date = moment(today).format();
	newWithdraw.type = 'VND';
	newWithdraw.code = "W"+date;
	newWithdraw.save((err, WithdrawStored)=>{
		err ? callback(false) : callback(true);
	});
}

var update_balace = function(name , new_ast_balance,user_id,callback){
	var obj = null;
	if (name === 'VND') obj =  { 'balance.vnd_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'STC') obj = {'balance.stc_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}

function process_withdraw_vnd(string_receiverabit,callback){
	var build_String = string_receiverabit.split("_");
	var id_user = build_String[0];
	var amount = parseFloat(build_String[1]);
	var bank_name = build_String[2];
	var account_number = build_String[3];
	var account_horder = build_String[4];
	var free = 0
	getUser(id_user,function(user){
		if (user) {
			var ast_balance = parseFloat(user.balance.vnd_wallet.available) - parseFloat(user.balance.vnd_wallet.available_lock);
			if (parseFloat(ast_balance) < parseFloat(amount)*100000000) 
			{
				callback(false);
			}
			else{
				Create_WithdrawVND(user,parseFloat(amount)*100000000,bank_name, account_number ,account_horder,0,function(cb){
					if (cb){
						var new_ast_balance = (parseFloat(ast_balance) - (parseFloat(amount)*100000000)).toFixed(2);
						update_balace('VND', new_ast_balance,user._id,function(calb){
							calb ? callback(true) : callback(false);
						})
					}
					else{
						callback(false);
					}
				})
			}
		}
		else {
			callback(false);
		}
	});
}
function process_withdraw(name, string_receiverabit,callback){
	var build_String = string_receiverabit.split("_");

	var id_user = build_String[0];
	var amount = parseFloat(build_String[1]);
	var address = build_String[2];
	var numWallet = null;
	var free = 0

	getUser(id_user,function(user){
		if (user) {
			if (name === 'VND') { numWallet = parseFloat(user.balance.vnd_wallet.available) - parseFloat(user.balance.vnd_wallet.available_lock) ,  free = 500000000000 };
			if (name === 'BTC') { numWallet = parseFloat(user.balance.btc_wallet.available) - parseFloat(user.balance.btc_wallet.available_lock) ,  free = 100000 };
			if (name === 'STC') { numWallet = parseFloat(user.balance.stc_wallet.available) - parseFloat(user.balance.stc_wallet.available_lock) ,  free = 50000 };
			var ast_balance = parseFloat(numWallet);
			if (parseFloat(ast_balance) < (parseFloat(amount)+ parseFloat(free))) {
				callback(false);
			}
			else
			{
				Create_Withdraw(name,user,amount,address,free,function(cb){
					if (cb){
						var new_ast_balance = (parseFloat(ast_balance - parseFloat(amount) - parseFloat(free))).toFixed(8);
						update_balace(name, new_ast_balance,user._id,function(calb){
							calb ? callback(true) : callback(false);
						})
					}
					else{
						callback(false);
					}
				})
				

				
			}
		}
		else {
			callback(false);
		}
	});
};

var newDepositObj = function(data, amount, address, tx ,name){
	var today = moment();
	return new Deposit({
		"user_id" : data._id,
		"amount" : amount*100000000,
		"confirm" : 0,
		"username" : data.displayName,
		"wallet" : address,
		"txid" : tx,
		"type" : name,
		"date" : moment(today).format(),
		"status" : 0
	})
}	

var getNameCoin = function(name, address){
	if (name === 'BTG') return {'balance.bitcoingold_wallet.cryptoaddress' : address};
	if (name === 'VND') return {'balance.bitcoin_wallet.cryptoaddress': address};
	if (name === 'STC') return {'balance.stc_wallet.cryptoaddress': address};
	return {'balance.dashcoin_wallet.cryptoaddress' : 'sdkjafhkjarthyiuertyiury'}
}

var fnFindAddress = function(name, amount, address,tx ,callback){
	
	User.findOne(
		getNameCoin(name,address)
	,function (err, data) {
		
		err || !data ? callback(false) : (
			newDepositObj(data, amount, address, tx, name).save(( err, DepositStored)=>{
				err ? callback(false) : callback(true)
			})
		);
	});
}

var checkTxdepo = function(name, tx, callback){
	Deposit.count({
		$and : [
        {'txid' : tx}, 
        { 'type': name }]
    }, (err, sum) => {
    	err || sum > 0 ? callback(false) : callback(true);
	});
}

var getTransaction = function(client , tx, callback){
	client.getTransaction(tx, function (err, transaction) {
		err || !transaction ? callback(null) : callback(transaction);
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

var process_deposit = function(name, client, tx ,callback){

	var details = null;
	getTransaction (client, tx, function(transaction){
		transaction !== null ? (
			
			details = transaction.details.filter(function (self) {
			    return self.category === 'receive'
			}),
			
			details.length > 0 ? (
				checkTxdepo(name, tx, function(check){
					console.log(check);
					check ? _.forEach(details, function(value,index ){
						console.log(value.amount , value.address);

						fnFindAddress(name, value.amount, value.address, tx, function(cb){
							details.length - 1 === index && callback(true) ;
						})

					}) : callback(true);
				})
			) : callback(false)
		) : callback(false)
	});			
};
function process_remove_withdraw(string_receiverabit,callback){

	var build_String = string_receiverabit.split("_");
	var user_id = build_String[0];
	var type = build_String[1];
	Withdraw.findOne(
	{ $and : [{'user_id' : user_id}, { 'status': 0 },{ 'type': type }]},(err,data)=>{
		var query;
		var data_update;
		err || ! data ? (
			callback(false)
		) :
		(
			query = {_id:data._id},
			data_update = {
				$set : {
					'status': 8
				}
			},
			Withdraw.update(query, data_update, function(err, Users){
				!err ? (
					get_balance(data.type,data.user_id,function(ast_balance){
						var new_ast_balance = (parseFloat(ast_balance) + parseFloat(data.amount) + parseFloat(data.fee)).toFixed(8);
						update_balace(data.type , new_ast_balance,data.user_id,function(cb){
							cb ? callback(true) : callback(false)
						})
					})
				) : callback(false)
			})
		)
	});
}

function process_deposit_coin(tx , callback){
	console.log("Deposit COIN");
	process_deposit('STC', STCclient , tx, function(cb){
		cb ? callback(true) : callback(false)
	});
			
}


function process_deposit_btc(tx,callback){
	process_deposit('VND', BTCclient , tx, function(cb){
		cb ? callback(true) : callback(false)
	});
}

function process_deposit_btg(tx , callback){
	process_deposit('BTG', BTGclient , tx, function(cb){
		cb ? callback(true) : callback(false)
	});
}


module.exports = {
	process_withdraw,
	process_withdraw_vnd,
	process_deposit_coin,
	process_deposit_btc,
	process_deposit_btg,
	process_remove_withdraw
}