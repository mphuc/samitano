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




function Balance(req,res){
	Withdraw.find({'user_id' : req.user._id},(err,result)=>{
		get_pedding_balance(req.user._id,function(data){
			check_pending_deposit(req.user._id,function(check_order){
				res.locals.title = 'Wallet';
				res.locals.menu = 'balance';
				res.locals.user = req.user;
				res.locals.withdraw_history = result;
				res.locals.balance = data;
				res.locals.check_order = check_order;
				res.render('account/balance');
			});
		});	
	});
}

function BalanceVND(req,res){
	var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
	req.session.token_crt = token_withdraw;	
	Deposit.findOne({$and : [{'user_id' : req.user._id}, { 'status': 0 },{ 'type': 'VND' }]},(err,result)=>{
		res.locals.token_crt = token_withdraw;
		res.locals.title = 'Ví VND';
		res.locals.menu = 'balance-vnd';
		res.locals.user = req.user;
		res.locals.deposit = (!err && result) ? true : false;
		res.locals.deposit_data = result;
		res.locals.has_login = true
		res.render('account/balance-vnd');
	})
	
}

function BalanceSTC(req,res){
	var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
	req.session.token_crt = token_withdraw;	
	get_new_address(STCclient,'STC',req.user,function(address_stc){
		res.locals.token_crt = token_withdraw;
		res.locals.title = 'Ví STC';
		res.locals.menu = 'balance-stc';
		res.locals.user = req.user;
		res.locals.has_login = true
		res.locals.address_stc = address_stc;
		
		res.render('account/balance-stc');
	})
	
		
	
}


function check_pending_deposit(user_id,callback){
	
	var check_order = {};
	check_order.btc = false;
	check_order.btg = false;
	
	Order.find({$and : [{'user_id' : user_id},{'status' : 0}]},(err,result_order)=>{
		(!err && result_order) && (
			result_order.forEach(function(item){
				if (item.method_payment == 'BTC')
					check_order.btc = true;
				if (item.method_payment == 'BTG')
					check_order.btg = true;
			})
		)
		callback(check_order);
	});
}

function get_pedding_balance(user_id,callback)
{
	var data = {};
	data.coin = 0;
	data.btc = 0;
	data.btg = 0;
	
	Deposit.find({$and : [{'user_id' : user_id}, { 'status': 0 }]},(err,result)=>{
		result.forEach(function(item){
			if (item.type == 'SVA') data.coin += parseFloat(item.amount);
			if (item.type == 'BTG') data.btg += parseFloat(item.amount);
			if (item.type == 'BTC') data.btc += parseFloat(item.amount);
			
		});
		callback(data);
	});
}

function getWithdraw_user_pendding_stc(req,res){
	Withdraw.find({$and : [{'user_id' : req.user._id}, { 'status': 0 },{ 'type': 'STC' }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8)+' STC',
				'wallet': result[i].wallet,
				'status' : '<span class="badge badge-warning">Đã lên lịch</span>',
				'remove_order' : '<button class="remove_order" data-id="'+result[i]._id+'"> <i class="fa fa-times "></i> </button>'

			});
		}
		return res.status(200).send({result: new_data_user});
	});
}

function getDeposit_user_pendding_stc(req,res){
	Deposit.find({$and : [{'user_id' : req.user._id}, {'type' : 'STC'}]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success">Hoàn tất</span>' : '<span class="badge badge-warning">Chờ xác nhận</span>';

			var confirms = result[i].type == 'STC' ? '/1' : '/3';

			var url_exchain = result[i].txid;
			if (result[i].type == 'BTC')
				url_exchain = '<a target="_blank" href="https://blockchain.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			if (result[i].type == 'BTG')
				url_exchain = '<a target="_blank" href="https://btgexplorer.com/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			

			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8),
				'type': result[i].type,
				'confirm' : result[i].confirm+confirms,
				'status' : status,
				'txid' : url_exchain

			});
		}

		return res.status(200).send({result: new_data_user});
	});
}

function getWithdraw_user_finish_vnd(req,res){
	Withdraw.find({$and : [{'user_id' : req.user._id},{ 'type': 'VND' }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success">Đã giao hàng</span>' : '<span class="badge badge-warning">Chờ chuyển giao</span>';
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': format_vnd(parseFloat(result[i].amount)/100000000),
				'code': result[i].code,
				'status' : status

			});
		}
		return res.status(200).send({result: new_data_user});
	});
}
function getWithdraw_user_history_vnd(req,res){
	Withdraw.find({$and : [{'user_id' : req.user._id},{ 'type': 'VND' },{ 'status': 1 }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success">Đã giao hàng</span>' : '<span class="badge badge-warning">Chờ chuyển giao</span>';
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': format_vnd(parseFloat(result[i].amount)/100000000),
				'code': result[i].code,
				'status' : status

			});
		}
		return res.status(200).send({result: new_data_user});
	});
}

function getWithdraw_user_finish_stc(req,res){
	Withdraw.find({$and : [{'user_id' : req.user._id},{ 'type': 'STC' }, {$or: [{ 'status': 1 },{ 'status': 8 }]}]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success">Hoàn thành</span>' : '<span class="badge badge-warning">Chờ chuyển giao</span>';
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8)+' STC',
				'wallet': result[i].wallet,
				'status' : status,
				'txid' : result[i].txid
			});
		}

		return res.status(200).send({result: new_data_user});
	});
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
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function getDeposit_user_finish_vnd(req,res){
	Deposit.find({$and : [{'user_id' : req.user._id},{ 'type': 'VND' }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success processed">Đã hoàn tất</span>' : '<span class="badge badge-danger cancelled">Đã hủy</span>';

			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': format_vnd(parseFloat(result[i].amount)/100000000),
				'type': result[i].type,
				'status' : status,
				'contentbank' : result[i].contentbank
			});
		}
		return res.status(200).send({result: new_data_user});
	});
}
function getDeposit_user_finish_vnd_history(req,res){
	Deposit.find({$and : [{'user_id' : req.user._id},{ 'type': 'VND' },{ 'status': 1 }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success processed">Đã hoàn tất</span>' : '<span class="badge badge-danger cancelled">Đã hủy</span>';

			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': format_vnd(parseFloat(result[i].amount)/100000000),
				'type': result[i].type,
				'status' : status,
				'contentbank' : result[i].contentbank
			});
		}
		return res.status(200).send({result: new_data_user});
	});
}
function getDeposit_user_finish_stc(req,res){
	Deposit.find({$and : [{'user_id' : req.user._id},{ 'type': 'STC' }, { 'status': 1 }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? '<span class="badge badge-success processed">Đã hoàn tất</span>' : 'Cancel';

			var url_exchain = result[i].txid;
			if (result[i].type == 'BTC')
				url_exchain = '<a target="_blank" href="https://blockchain.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			if (result[i].type == 'BTG')
				url_exchain = '<a target="_blank" href="https://btgexplorer.com/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8),
				'type': result[i].type,
				'status' : status,
				'txid' : result[i].txid
			});
		}

		return res.status(200).send({result: new_data_user});
	});
}

var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(data.balance.vnd_wallet.available),
			name === 'BTC' && callback(data.balance.btc_wallet.available),
			name === 'STC' && callback(data.balance.stc_wallet.available)
		) : callback (balance) 
	})
}

function get_coin_details(name,callback){
	var data = {};
	if (name === 'VND') { data.confirmations = 3,  data.free = 500000000000, data.client = BTCclient };
	if (name === 'BTC') { data.confirmations = 3,  data.free = 100000, data.client =  BTCclient };
	if (name === 'STC') { data.confirmations = 3,  data.free = 50000, data.client =  STCclient };
	callback(data);
}

function check_wallet(Client,wallet,callback){
	Client.validateAddress(wallet, function (err, valid) {
		err || !valid.isvalid ? callback(false) : callback(true)
		//err || !valid.isvalid ? callback(true) : callback(true)
	})
}

function SubmitWithdraw(req,res){

	var wallet = req.body.wallet;
	var amount = parseFloat(req.body.amount)*100000000;
	var user = req.user;
	var type = req.body.type;
	if ( !wallet)
	{
		return res.status(404).send({message: 'Vui lòng nhập địa chỉ ví '+type+'!'});
	}
	
	if ( !amount || isNaN(amount) || amount < 0.01)
	{
		return res.status(404).send({message: 'Vui lòng nhập số lượng rút > '+type+'!'});
	}

	
	if (req.user.security.two_factor_auth.status == 1)
	{
		var verified = speakeasy.totp.verify({
	        secret: user.security.two_factor_auth.code,
	        encoding: 'base32',
	        token: req.body.authenticator
	    });
	    if (!verified) {
	    	return res.status(404).send({ message: 'Mã xác thực mà bạn nhập là không chính xác.'});
	    }
	}
			
	get_coin_details(type,function(coin_details){
		get_balance(type,user._id,function(ast_balance){
			if (parseFloat(ast_balance) < parseFloat(amount)+parseFloat(coin_details.free)) 
			{
				return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
			}
			else
			{
				var string_sendrabit;
				check_wallet(coin_details.client,wallet,function(cb){
					cb ? (
						(req.body.token_crt == req.session.token_crt) ? (
							req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
							string_sendrabit = user._id.toString()+'_'+amount.toString()+'_'+wallet.toString(),
							sendRabimq.publish('','Withdraw_QWE'+type,new Buffer(string_sendrabit)),
							res.status(200).send({error: '', status: 1, message: 'Withdraw success'})
						) : (
							res.status(200).send({error: '', status: 1, message: 'Withdraw success'})
						)
					) : (
						res.status(404).send({message:'Vui lòng nhập địa chỉ ví '+type+'!'})
					)
				})
				
			}
		})
	})
		
}


var update_wallet = function(name ,wallet,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.cryptoaddress': wallet }
	if (name === 'BTG') obj =  {'balance.bitcoingold_wallet.cryptoaddress' : wallet};
	if (name === 'STC') obj = {'balance.stc_wallet.cryptoaddress': wallet};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'BTG') obj =  {'balance.bitcoingold_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'STC') obj = {'balance.stc_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
function get_new_address(Client,name,user,callback){
	var wallet = '';
	if (name === 'BTC') wallet = user.balance.btc_wallet.cryptoaddress;
	if (name === 'STC') wallet = user.balance.stc_wallet.cryptoaddress;

	wallet === "" ? (
		
		Client.getNewAddress('', function (err, address){
			err || !address ? (
				callback(null)
			) : (
				update_wallet(name,address,user._id,function(cb){
					cb ? callback(address) : callback(null)
				})
			)

		})
	):(
		callback(wallet)
	)
}

var newDepositObjvnd = function(user_id, displayName, namebank, numberbank ,horderbank,branchbank,contentbank,amount){
	var today = moment();
	return new Deposit({
		"user_id" : user_id,
		"username" : displayName,
		"namebank" : namebank,
		"numberbank" : numberbank,
		"horderbank" : horderbank,
		"branchbank" : branchbank,
		"contentbank" : contentbank,
		"type" : 'VND',
		"date" : moment(today).format(),
		"status" : 0,
		"txid" : '',
		"confirm" : 0,
		"amount" : amount
	})
}	

function getbankvnd(user_id,displayName,amount,callback){
	var result = {};
	Deposit.count({
		$and : [
		{'user_id' : user_id},
        {'status' : 0}, 
        { 'type': 'VND' }]
    }, (err, sum) => {
    	if (!err && sum == 0)
    	{	
    		var date = new Date();
			var date = date.getTime();
			var fee = 6204;
    		result.namebank = 'Vietcombank';
    		result.numberbank = '0441000616599';
    		result.horderbank = 'VO TIEN DAT';
    		result.branchbank = 'Hồ Chí Minh';
    		result.contentbank = "D"+date;
    		newDepositObjvnd(user_id, displayName, result.namebank, result.numberbank ,result.horderbank,result.branchbank,result.contentbank,amount).save(( err, DepositStored)=>{
				callback(true);
			})
    	}
    	else
    	{
    		callback(true);
    	}
	});
}

function GetWallet (req,res){
	var htmls;
	req.body.type ? (
		req.body.type == 'VND' ? (
			getbankvnd(req.user._id,req.user.displayName,function(result){
				console.log(result);
				htmls = '<p>Ngân hàng: '+result.namebank+'</p>',
				htmls += '<p>Số tài khoản: '+result.numberbank+'</p>',
				htmls += '<p>Tên tài khoản: '+result.horderbank+'</p>',
				htmls += '<p>Chi nhánh: '+result.branchbank+'</p>',
				htmls += '<p>Nội dung chuyển tiền: '+result.contentbank+'</p>',
				res.status(200).send({ wallet: htmls, message: 'Success!' })
			})
		) :
		(
			get_coin_details(req.body.type,function(data){
				get_new_address(data.client,req.body.type,req.user,function(callback){
					callback === null ? (
						res.status(404).send({message:`Can't create new address. Please try again`})
					) : (
						res.status(200).send({ wallet: callback, message: 'Success!' })
					)
				})	
			})
		)
	) : res.status(404).send({message:`Can't create new address. Please try again`})
}

function create_token(req,res){
	var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
	req.session.token_crt = token_withdraw;	
	return res.status(200).send({'token': token_withdraw});				
}

function Remove_Withdraw (req,res){
	var user = req.user;
	var string_sendrabit = req.body.id;
	sendRabimq.publish('','Remove_Withdraw_QWE',new Buffer(string_sendrabit));
	return res.status(200).send({ message: 'Success' });
}
function Deposit_VND (req,res){
	var amount = req.body.amount
	if ( !amount || isNaN(amount) || amount < 100000)
	{
		return res.status(500).send({ message: 'Error!' }); 
	}
	else
	{
		if (req.body.token_crt == req.session.token_crt)
		{
			req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
			getbankvnd(req.user._id,req.user.displayName,parseFloat(amount)*100000000,function(result){
				res.status(200).send({ message: 'Success!' });
			})
		} 
		else
		{
			res.status(200).send({ message: 'Success!' });
		}
		
	}
}

function CancelDeposit_VND (req,res){
	Deposit.update({$and : [{'user_id' : req.user._id}, { 'status': 0 },{ 'type': 'VND' }]},{'$set' : {'status' : 8}},function(err,result){
		res.redirect('/balance/vnd');
	})
}
function CancelWidthdraw_VND (req,res){
	var string_sendrabit = (req.user._id).toString()+'_'+'VND';
	sendRabimq.publish('','Remove_Withdraw_QWE',new Buffer(string_sendrabit));
	setTimeout(function() {
		res.redirect('/balance/vnd');
	}, 500);
}

function CancelWidthdraw_STC (req,res){
	var string_sendrabit = (req.user._id).toString()+'_'+'STC';
	sendRabimq.publish('','Remove_Withdraw_QWE',new Buffer(string_sendrabit));
	setTimeout(function() {
		res.redirect('/balance/stc');
	}, 500);
}


function WidthdrawVnd (req,res){	
	var bank_name = req.body.bank_name;
	var account_number = req.body.account_number;
	var account_horder = req.body.account_horder;
	var amount = req.body.amount;
	var user = req.user;
	if (!bank_name || !account_number || !account_horder) 
	{
		return res.status(404).send({message: 'Vui lòng điền đầy đủ thông tin ngân hàng'});
	}
	if (isNaN(amount) || !amount || amount < 100000)
	{
		return res.status(404).send({message: 'Số tiền rút phải lớn hơn 100,000 VND'});
	}
	if (req.user.security.two_factor_auth.status == 1)
	{
		var verified = speakeasy.totp.verify({
	        secret: user.security.two_factor_auth.code,
	        encoding: 'base32',
	        token: req.body.authenticator
	    });
	    if (!verified) {
	    	return res.status(404).send({ message: 'Mã xác thực mà bạn nhập là không chính xác.'});
	    }
	}
	get_balance('VND',user._id,function(ast_balance){
		if (parseFloat(ast_balance) < parseFloat(amount)*100000000) 
		{
			return res.status(404).send({error: 'amount', message: 'Số dư tài khoản của bạn không đủ'});
		}
		else
		{
			if (req.body.token_crt == req.session.token_crt)
			{
				req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
				var string_sendrabit;
				string_sendrabit = user._id.toString()+'_'+amount.toString()+'_'+bank_name.toString()+'_'+account_number.toString()+'_'+account_horder.toString(),
				sendRabimq.publish('','Withdraw_QWEVND',new Buffer(string_sendrabit)),
				res.status(200).send({message: 'Withdraw success'})
			}
			else
			{
				res.status(401).send({message: 'Error'})
			}
		}
	})	
}

function GetVietCombank(req,res){
	var accountnumber = req.params.accountnumber;

	Bank.findOne({'amount_number' : accountnumber},function(err,result){
		if (!err && result)
		{
			res.status(200).send({'status' : 'finish','amount_number': result.amount_number,'amount_horder':result.amount_horder,'bank_name':result.bank_name})
		}
		else
		{
			request({
		        url: 'https://santienao.com/api/v1/bank_accounts/'+accountnumber,
		        json: true
		    }, function(error, response, body) {

		    	if (body)
		    	{
		    		if (body.state == 'error' || body.state == 'fetching')
		    		{
		    			res.status(200).send({'status' : 'error'})
		    		}
		    		else
		    		{
		    			var newBank = new Bank();
			    		newBank.amount_number = body.account_id;
			    		newBank.amount_horder = body.account_name;
			    		newBank.bank_name = body.bank_name;
			    		newBank.save( (err) => {
			    			res.status(200).send({'status' : 'finish','amount_number': body.account_id,'amount_horder':body.account_name,'bank_name':body.bank_name})
			    		})
		    		}
		    	}
			});
		}
	})
}

module.exports = {
	Balance,
	SubmitWithdraw,
	GetWallet,
	getWithdraw_user_pendding_stc,
	getDeposit_user_pendding_stc,
	getWithdraw_user_finish_vnd,
	getDeposit_user_finish_vnd,
	getWithdraw_user_finish_stc,
	getDeposit_user_finish_stc,
	Remove_Withdraw,
	create_token,
	BalanceVND,
	Deposit_VND,
	CancelDeposit_VND,
	WidthdrawVnd,
	CancelWidthdraw_VND,
	BalanceSTC,
	CancelWidthdraw_STC,
	getDeposit_user_finish_vnd_history,
	GetVietCombank,
	getWithdraw_user_history_vnd
}