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


function ListWithdraw(req, res){
	get_all_server(function(balance){
		if (!balance) balance = 0;
		Withdraw.find({'$and' : [{'status' : 0},{'type' : 'VND'}]}, (err, data)=>{
			if (err ) {
				res.status(500).send({'message': 'data not found'});
			}else{
				// res.status(200).send(users);
				if (data.length >0)
				{
					var total_vnd = 0;
					forEach(data, function(value, index){
						
						var done = this.async();
						
						total_vnd += parseFloat(value.amount);
							
						
							
						done();
						data.length - 1 === index && (
							res.render('admin/withdraw', {
								title: 'Withdraw',
								layout: 'layout_admin.hbs',
								history: data,
								total_vnd : total_vnd,
								
								balance : balance
							})
						)
					})
				}
				else
				{
					res.render('admin/withdraw', {
						title: 'Withdraw',
						layout: 'layout_admin.hbs',
						history: data,
						total_coin : 0,
						total_btc : 0,
						
						balance : 0
					})
				}
				
			}
		})
	})
	
}

function get_all_server(callback)
{
	var data = {};
	get_balance_server(BTCclient,function(btc){
		data.btc = btc;
		get_balance_server(BBLclient,function(bbl){
			data.bbl = bbl;
			callback(data);
		})
	})
}

function get_balance_server(Client,callback)
{
	Client.getInfo(function(err,result){
		if (result) callback(result.balance);
		else callback(0)
	})
}


function ListWithdrawhistory(req, res){
	Withdraw.find({
		"user_id": {
	        "$not": {
	            "$in": ["5a55ce6590928d62738e9949"]
	        }
	    },
	    status: '1'
	}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			res.render('admin/withdraw_history', {
				title: 'Withdraw',
				layout: 'layout_admin.hbs',
				history: data
			});
		}
	})
}
function WithdrawEnlable(req, res){
	var id = req.query.id;
	if (id) {
		Withdraw.update({'_id':id},{ $set : {'status' : 1}},function(err,result){
			res.redirect('/qwertyuiop/admin/withdraw');
		})
	}
}
function WithdrawDisable(req, res){
	var id = req.query.id;
	if (id) {
		Withdraw.update({'_id':id},{ $set : {'confirm' : 0}},function(err,result){
			res.redirect('/qwertyuiop/admin/withdraw');
		})
	}
}

module.exports = {
	ListWithdraw,
	ListWithdrawhistory,
	WithdrawEnlable,
	WithdrawDisable
	
}