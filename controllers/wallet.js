'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('../config');
const amqp = require('amqplib/callback_api');
const sendRabimq = require('../rabbit_comfim');
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
function Index(req,res){
	var user = req.user
	if (req.body.wallet == 'BTC') {
		var wallet_btc = user.balance.bitcoin_wallet.cryptoaddress
		if (wallet_btc == "") {
			BTCclient.getNewAddress(user.email, function (err, address) {
				if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
				var data_update = {
					$set : {
						'balance.bitcoin_wallet.cryptoaddress': address
					}
				};
				User.update({_id:user._id}, data_update, function(err, Users){
					if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
					return res.status(200).send({
						wallet: address,
						message: 'Success!'
					});
				});
				
			});
		}else{
			return res.status(200).send({wallet: wallet_btc,message: 'Success!'});
		}
	}
	if (req.body.wallet == 'AST') {
		var wallet_coin = user.balance.coin_wallet.cryptoaddress
		var email_user = user.email+'_';
		if (wallet_coin == "") {
			STCclient.getNewAddress(email_user, function (err, address) {
				if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
				var data_update = {
					$set : {
						'balance.coin_wallet.cryptoaddress': address
					}
				};
				User.update({_id:user._id}, data_update, function(err, Users){
					if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
					return res.status(200).send({
						wallet: address,
						message: 'Success!'
					});
				});
				
			});
		}else{
			return res.status(200).send({wallet: wallet_coin,message: 'Success!'});
		}
	}
	
}



function Notify(req,res){
	
	var tx = req.params.txid;
	sendRabimq.publish('','COIN_STCMKS',new Buffer(tx));
	return res.status(200).send('COIN');
}


function NotifyBTC(req,res){
	var tx = req.params.txid;
	sendRabimq.publish('','BTC_STCMKS',new Buffer(tx));

	console.log(tx,'BTC');

	return res.status(200).send('BTC');
}


function NotifyBTG(req,res){
	var tx = req.params.txid;
	sendRabimq.publish('','BTG',new Buffer(tx));
	console.log(tx,'BTG');
	return res.status(200).send('BTG');
}


/*function NotifyBCC(req,res){
	var tx = req.params.txid;
	sendRabimq.publish('','BCC',new Buffer(tx));
	console.log(tx,'BCC');
	return res.status(200).send('BCC');
}*/


function Indexrefferal(req,res){
	res.render('account/affiliate_refferal', {
		title: 'YOUR AFFILIATES',
		menu: 'affiliate',
		user: req.user
	});
}
function Indexpromo(req,res){
	res.render('account/affiliate_promo_materials', {
		title: 'PROMO MATERIALS',
		menu: 'affiliate',
		user: req.user
	});
}
function getRefferal(req,res){
	User.find({p_node: req.session.userId}, { displayName: 1, email: 1, signupDate: 1, _id: 0 },(err,data_user)=>{
		if(err) return res.status(500).send({message:`Error load your refferal`})
		if(!data_user) return res.status(404).send({message:`Error load your refferal`})

		var new_data_user = [];
		
		if (data_user == undefined)
			return res.status(200).send({refferal: data_user});
		
		for (var i = data_user.length - 1; i >= 0; i--) {
			new_data_user.push({
				'signupDate': moment(data_user[i].signupDate).format('MM/DD/YYYY LT'),
				'email': data_user[i].email,
				'displayName': data_user[i].displayName,
			});
		}

		return res.status(200).send({refferal: new_data_user});

		res.status(200).send({refferal : data_user});
	})
}
module.exports = {
	Index,
	Notify,
	NotifyBTC,
	NotifyBTG
	
}