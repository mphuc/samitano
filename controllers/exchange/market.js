'use strict'
const mongoose = require('mongoose');
const User = require('../../models/user');
const OrderBuy = require('../../models/exchange/orderbuy').module();
const OrderSell = require('../../models/exchange/ordersell').module();
const MarketHistory = require('../../models/exchange/markethistory').module();
const Volume = require('../../models/exchange/volume').module();
const request = require('request');
const bitcoin = require('bitcoin');
const amqp = require('amqplib/callback_api');
const sendRabimq = require('../../rabbit_comfim');
const moment = require('moment');
const Ticker = require('../../models/ticker');
const bcrypt = require('bcrypt-nodejs');
const _ = require('lodash');


function create_session(req,res)
{
	
	if (req.query.id)
	{
		var tokensss;
		User.findOne({'wallet' : req.query.id},(err,data)=>{
			(!err && data)? (
				randomstring(function(string){
					string && (
						req.session.userId = data._id,
						tokensss = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
						tokensss = tokensss+string,
						console.log(tokensss),
						User.update({'_id' : data._id},{ $set : {'wallet' : tokensss}},function(err,result){
							res.redirect('/Market/Index/BTC-SVA')
						})
					)
				})
			) : res.redirect('/Market/Index/BTC-SVA')
		})
	}
	else
	{
		res.redirect('/Market/Index/BTC-SVA')
	}
}

function Indexs(req,res) {

	var MarketName = 'VND-STC';
	var coin_wallet = 0;
	var exchange_wallet = 0;
	req.session.userId ? (
		ger_user(req.session.userId,function(result){
			result === null ?(
				
				res.locals.MarketName = MarketName,
				res.locals.namecoin = MarketName.split('-')[0],
				res.locals.exchange = MarketName.split('-')[1],
				res.locals.has_login = false,
				res.locals.coin_wallet = 0,
				res.locals.exchange_wallet = 0,
				res.locals.title = MarketName,
				res.locals.menu = 'exchange_market',
				//res.locals.layout = 'market.hbs',
			 	res.render('exchange/market')
			) : (
				
				get_balance(MarketName.split('-')[0],req.session.userId,function(balance_coin){
					get_balance(MarketName.split('-')[1],req.session.userId,function(balance_exchainge){
						res.locals.MarketName = MarketName,
						res.locals.namecoin = MarketName.split('-')[0],
						res.locals.exchange = MarketName.split('-')[1],
						res.locals.has_login = true,
						res.locals.user = result,
						res.locals.coin_wallet = balance_coin,
						res.locals.exchange_wallet = balance_exchainge,
						res.locals.title = MarketName,
						//res.locals.layout = 'market.hbs',
						res.locals.menu = 'exchange_market',
						
					 	res.render('exchange/market')
					})
				})
				
			)
		})
	) : (
		
		res.locals.MarketName = MarketName,
		res.locals.namecoin = MarketName.split('-')[0],
		res.locals.exchange = MarketName.split('-')[1],
		res.locals.has_login = false,
		res.locals.title = MarketName,
		res.locals.coin_wallet = 0,
		res.locals.exchange_wallet = 0,
		res.locals.menu = 'exchange_market',
		//res.locals.layout = 'market.hbs',
	 	res.render('exchange/market')
	)
}

function TempalteOrder(req,res) {

	
	var MarketName = 'BTC-SVA';
	res.locals.namecoin = MarketName.split('-')[0],
	res.locals.exchange = MarketName.split('-')[1],

	res.locals.menu = 'exchange_market',
	res.locals.title = 'Order History',
	res.locals.user = req.user;
 	res.render('exchange/order')
	
}

function ger_user(userId,callback){
	User.findOne({_id :userId},(err,result)=>{
		err || !result ? callback(null) : callback(result);
	})
}
var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(data.balance.bitcoin_wallet.available),
			name === 'BCH' && callback(data.balance.bitcoincash_wallet.available),
			name === 'BCC' && callback(data.balance.bitconnect_wallet.available),
			name === 'LTC' && callback(data.balance.litecoin_wallet.available),
			name === 'STC' && callback(data.balance.coin_wallet.available),
			name === 'DASH' && callback(data.balance.dashcoin_wallet.available),
			name === 'XVG' && callback(data.balance.verge_wallet.available),
			name === 'BTG' && callback(data.balance.bitcoingold_wallet.available),
			name === 'XZC' && callback(data.balance.zcoin_wallet.available)
		) : callback (balance) 
	})
}
var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'VND') obj =  { 'balance.bitcoin_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'BCH') obj =  {'balance.bitcoincash_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'BCC') obj = {'balance.bitconnect_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'LTC') obj = {'balance.litecoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'STC') obj = {'balance.coin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'DASH') obj = {'balance.dashcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XVG') obj = {'balance.verge_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BTG') obj = {'balance.bitcoingold_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XZC') obj = {'balance.zcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'ETH') obj = {'balance.ethereum_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
function SubmitBuy(req,res) {
	if (req.body.MarketName && req.body.quantity && req.body.price && parseFloat(req.body.quantity) > 0 && parseFloat(req.body.price) > 0 && parseFloat(req.body.total) > 0.0005 && req.body.token_crt == req.session.token_crt)
	{
		req.session.token_crt = 'sfcaasdasdsa';
		var MarketExchange = req.body.MarketName;
		var quantity_Buy = parseFloat(req.body.quantity).toFixed(8);
		var price_Buy = parseFloat(req.body.price).toFixed(8);
		var fee = 1.0025;
        var total = (quantity_Buy*price_Buy*fee).toFixed(8);
        var subtotal = (quantity_Buy*price_Buy).toFixed(8);
        var commission = (quantity_Buy*price_Buy*0.0025).toFixed(8);

        get_balance(MarketExchange.split('-')[0],req.user._id,function(balance){
        	if (parseFloat(balance) >= total*100000000)
        	{
        		var string_sendrabit = MarketExchange.toString()+'_'+quantity_Buy.toString()+'_'+price_Buy.toString()+'_'+req.user._id.toString();
				sendRabimq.publish('','Exchange_Buy_STCMKS',new Buffer(string_sendrabit));

				return res.status(200).send();
        	}
        	else
        	{
        		return res.status(401).send({ message : 'Số dư tài khoản không đủ' });
        	}
        })
	}
	else
	{
		return res.status(401).send({ message : 'Error!' });
	}
}

function SubmitSell(req,res) {

	/*Ticker.findOne({}, function(err,data_ticker){
		if (parseFloat(req.body.price)*100000000 < 16000)
		{
			return res.status(401).send({ message : 'Error' });
		}
		else
		{
			if (req.user._id == '5a674177285dd5466e001768')
			{*/


	if (req.body.MarketName && req.body.quantity && req.body.price && parseFloat(req.body.quantity) > 0 && parseFloat(req.body.price) > 0 && req.body.token_crt == req.session.token_crt)
	{
		
		req.session.token_crt = 'sfcaasdasdsa';
		var MarketExchange = req.body.MarketName;

		var quantity_Buy = parseFloat(req.body.quantity).toFixed(8);
		var price_Buy = parseFloat(req.body.price).toFixed(8);
		var fee = 0.9975;
        var total = (quantity_Buy*price_Buy).toFixed(8);
        var subtotal = (quantity_Buy*price_Buy).toFixed(8);
        var commission = (quantity_Buy*price_Buy*0.0025).toFixed(8);

       

        get_balance(MarketExchange.split('-')[1],req.user._id,function(balance){

        	if (parseFloat(balance) >= quantity_Buy*100000000)
        	{
        		var string_sendrabit = MarketExchange.toString()+'_'+quantity_Buy.toString()+'_'+price_Buy.toString()+'_'+req.user._id.toString();
				sendRabimq.publish('','Exchange_Sell_STCMKS',new Buffer(string_sendrabit));
				return res.status(200).send();
        	}
        	else
        	{
        		return res.status(401).send({ message : 'Số dư tài khoản không đủ' });
        	}
        })
			
	}
	else
	{
		return res.status(401).send({ message : 'Error!' });
	}
			/*}
			else
			{
				return res.status(401).send({ message : 'Error' });
			}
		}
	});*/
			
		
}
function CancelOrder(req,res) {
	
	if (req.body.data)
	{	
		var string_sendrabit = (req.body.data).toString()+'_'+req.user._id.toString();

		console.log(string_sendrabit);

		sendRabimq.publish('','Cancel_Exchange_Open_STCMKS',new Buffer(string_sendrabit));
		return res.status(200).send();
	}
	else
	{
		return res.status(404).send();
	}
}



function LoadOrder_buyAll(req,res){

	OrderBuy.find({$and : [{'MarketName' : req.query.MarketName}, { 'status': 0 }]},{ _id: 1,user_id: 1, MarketName: 1 , quantity : 1, price : 1, total : 1},(err,result)=>{
		return res.status(200).send({result: result});
	});
}

function LoadOrder_sellAll(req,res){
	OrderSell.find({$and : [{'MarketName' : req.query.MarketName}, { 'status': 0 }]},{_id: 1, user_id: 1, MarketName: 1 , quantity : 1, price : 1, total : 1},(err,result)=>{
		return res.status(200).send({result: result});
	});
}

function LoadOrder_Open_id(req,res){
	OrderBuy.find({$and : [{'MarketName' : req.query.MarketName}, { 'status': 0 }, { 'user_id': req.user._id }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			new_data_user.push({
				'date' : moment(result[i].date).format('MM/DD/YYYY LT'),
				'type' : 'Buy',
				'price': addCommas(parseFloat(result[i].price)/100000000),
				'quantity': (parseFloat(result[i].quantity)/100000000).toFixed(8),
				'commission' : addCommas(parseFloat(result[i].commission)/100000000),
				'total' : addCommas(parseFloat(result[i].total)/100000000),
				'remove' : result[i]._id+'_Buy'
			});
		}
		OrderSell.find({$and : [{'MarketName' : req.query.MarketName}, { 'status': 0 }, { 'user_id': req.user._id }]},(err,results)=>{
			for (var i = results.length - 1; i >= 0; i--) {
				new_data_user.push({
					'date' : moment(results[i].date).format('MM/DD/YYYY LT'),
					'type' : 'Sell',
					'price': addCommas(parseFloat(results[i].price)/100000000),
					'quantity': (parseFloat(results[i].quantity)/100000000).toFixed(8),
					'commission' : addCommas(parseFloat(results[i].commission)/100000000),
					'total' : addCommas(parseFloat(results[i].total)/100000000),
					'remove' : results[i]._id+'_Sell'
				});
			}

			return res.status(200).send({result: new_data_user});
		})
		
	});
}function addCommas(nStr)
{
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
function ReloadBalance(req,res){
	if (req.body.MarketName)
	{	
		var MarketName = req.body.MarketName;
		get_balance(MarketName.split('-')[0],req.user._id,function(balance_namecoin){
			get_balance(MarketName.split('-')[1],req.user._id,function(balance_exchange){
				return res.status(200).send({'exchange' : addCommas(parseFloat(balance_namecoin)/100000000),'namecoin' : (parseFloat(balance_exchange)/100000000).toFixed(8)});
			})
		})	
	}
	else
	{
		return res.status(401).send();
	}
}

function LoadMarketHistory(req,res){
	if (req.query.MarketName)
	{
		MarketHistory.find({'MarketName' : req.query.MarketName},{ MarketName: 1 , quantity : 1, price : 1, total : 1 , type: 1,date: 1},(err,result)=>{
			return res.status(200).send({result: result});
		}).limit(2000).sort({
		    "date": -1
		}); 
	}
	else
	{
		return res.status(401).send();
	}
	
}

function LoadMyMarketHistory(req,res){
	if (req.query.MarketName)
	{
		MarketHistory.find({ $and : [
			{'MarketName' : req.query.MarketName},
			{
				$or : [{'user_id_buy' : req.user._id},{'user_id_sell' : req.user._id}]
			}]
		} ,(err,result)=>{
			return res.status(200).send({result: result});
		}); 
	}
	else
	{
		return res.status(401).send();
	}
}

function LoadVolume(req,res){


	Ticker.findOne({}, function(err,data){

		var usd;
		if (req.query.MarketName.split("-")[0] == 'VND')
			usd = data.btc.usd;
		if (req.query.MarketName.split("-")[0] == 'BCC')
			usd = data.bcc.usd;
		if (req.query.MarketName.split("-")[0] == 'BCH')
			usd = data.bch.usd;
		if (req.query.MarketName.split("-")[0] == 'BTG')
			usd = data.btg.usd;
		if (req.query.MarketName.split("-")[0] == 'ETH')
			usd = data.eth.usd;
		if (req.query.MarketName.split("-")[0] == 'LTC')
			usd = data.ltc.usd;
		if (req.query.MarketName.split("-")[0] == 'DASH')
			usd = data.dash.usd;
		if (req.query.MarketName.split("-")[0] == 'STC')
			usd = data.coin.usd;
		if (req.query.MarketName.split("-")[0] == 'XZC')
			usd = data.xzc.usd;
		
		Volume.findOne({'MarketName' : req.query.MarketName},(err,result)=>{
			return res.status(200).send({result: result,usd : usd});
		}); 	
	})
}

function load_ticker(req,res){
	Ticker.findOne({}, function(err,data){
		return res.status(200).send({result: data});
	});
}
function randomstring(callback) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  callback(text);
}
module.exports = {
	Indexs,
	SubmitBuy,
	LoadOrder_buyAll,
	LoadOrder_sellAll,
	SubmitSell,
	LoadOrder_Open_id,
	CancelOrder,
	ReloadBalance,
	LoadMarketHistory,
	LoadVolume,
	LoadMyMarketHistory,
	load_ticker,
	create_session,
	TempalteOrder
}