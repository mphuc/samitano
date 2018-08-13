'use strict'
const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('../config');
const request = require('request');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const urlSlug = require('url-slug');
var sendpulse = require("sendpulse-api");
const OrderBuy = require('../models/exchange/orderbuy').module();
const OrderSell = require('../models/exchange/ordersell').module();
const MarketHistory = require('../models/exchange/markethistory').module();
const Volume = require('../models/exchange/volume').module();
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
var get_balance_no_lock =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(parseFloat(data.balance.vnd_wallet.available) ),
			name === 'BTC' && callback(parseFloat(data.balance.btc_wallet.available) ),
			name === 'STC' && callback(parseFloat(data.balance.stc_wallet.available) ) 
		) : callback (balance) 
	})
}
var get_balance_lock =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(parseFloat(data.balance.vnd_wallet.available_lock)),
			name === 'BTC' && callback(parseFloat(data.balance.btc_wallet.available_lock)),
			name === 'STC' && callback(parseFloat(data.balance.stc_wallet.available_lock)) 
		) : callback (balance) 
	})
}
var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.btc_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'VND') obj =  {'balance.vnd_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'STC') obj = {'balance.stc_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var update_balace_lock = function(name , new_ast_balance,user_id,callback){
	
	var obj = null;
	if (name === 'BTC') obj =  { 'balance.btc_wallet.available_lock': parseFloat(new_ast_balance) }
	if (name === 'VND') obj =  {'balance.vnd_wallet.available_lock' : parseFloat(new_ast_balance)};
	if (name === 'STC') obj = {'balance.stc_wallet.available_lock': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var newOrderBuy = function(user_id, MarketName,price,min_amount, max_amount){
	var today = moment();
	return new OrderBuy({
		"user_id" : user_id,
		"MarketName" : MarketName,
		"price" : price,
		"min_amount" : min_amount,
		"max_amount" : max_amount,
		"date" : moment(today).format(),
		"status" : 0
	})
}	


var newOrderSell = function(user_id, MarketName,quantity,price, subtotal, commission ,total){
	var today = moment();
	return new OrderSell({
		"user_id" : user_id,
		"MarketName" : MarketName,
		"quantity" : quantity,
		"price" : price,
		"subtotal" : subtotal,
		"commission" : commission,
		"total" : total,
		"date" : moment(today).format(),
		"status" : 0
	})
}

var UpdateVolume = function(data,MarketName,Last,hight,low,bid,ask,volume){
	//data,MarketName,-1,-1,-1,-1,ask,-1
	var query = {'_id' : data._id};
	var date_update;
	parseFloat(Last) > 0 && (
		date_update = {
			'last' : Last,
			'hight' : hight,
			'low' : low,
			'volume' : volume,
			'last_last' : data.last,
			'hight_last' : data.hight,
			'low_last' : data.low,
			'volume_last' : data.volume
		}
	);
	parseFloat(bid) > 0 && (
		date_update = {
			'bid' : bid,
			'bid_last' : data.bid
		}
	);
	parseFloat(ask) > 0 && (
		date_update = {
			'ask' : ask,
			'ask_last' : data.ask
		}
	);
	Volume.update(query,date_update,function(err,result){})
}


function update_volume(MarketName,Last,Bid,Ask,Volum){
	console.log(MarketName,Last,Bid,Ask,Volum);
	Volume.findOne({'MarketName' : MarketName},function(err,data){

		if (data)
		{
			parseFloat(Bid) > 0 && (
				OrderBuy.find({ $and : [{"MarketName" : MarketName},{"status" : "0"}]},
				function(errbuy,result_buyorder){
					Sortobject_buy(result_buyorder,function(max_buyorder){
						//var bid = Bid;//result_buyorder.length > 0 ? Bid : 0;
						var bid = result_buyorder.length > 0 ? max_buyorder[0].price : 0;
						UpdateVolume(data,MarketName,-1,-1,-1,bid,-1,-1);
					})
				})
			),
			parseFloat(Ask) > 0 &&(
				OrderSell.find({ $and : [{"MarketName" : MarketName},{"status" : "0"}]},
				function(errsell,result_sellorder){
					Sortobject_sell(result_sellorder,function(max_sellorder){
						var ask = result_sellorder.length > 0 ? max_sellorder[0].price : 0;
						UpdateVolume(data,MarketName,-1,-1,-1,-1,ask,-1);
					})
				})
			),
			parseFloat(Last) > 0 && (
				MarketHistory.find(
					{ $and : [{"MarketName" : MarketName},
					{
					    "date": 
					    {
					        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 1000)))
					    }
					}]
				},
				function(errs,result){
					Sortobject_buy(result,function(max_vol){
						Sortobject_sell(result,function(min_vol){
							if (result ){
								var total_volume = 0;
								for (var sss = result.length - 1; sss >= 0; sss--) 
								{
									total_volume +=  parseFloat(result[sss].total);
								}
							}
							var hight = result.length > 0 ? max_vol[0].price : data.hight;
							var low = result.length > 0 ? min_vol[0].price : data.low;
							UpdateVolume(data,MarketName,Last,hight,low,-1,-1,total_volume);
						})
					})
				})
			)
		}
	})
}

function process_sell(string_receiverabit,callback){

	var build_String = string_receiverabit.split("_");
	var MarketExchange = build_String[0];
	var quantity_Sell = build_String[1];
	var price_Sell = build_String[2];
	var user_id = build_String[3];
	
	var fee = 0.9975;
    
    var total = parseFloat(quantity_Sell);
    var total_not_fee = parseFloat(quantity_Sell*price_Sell);
    var subtotal = parseFloat(quantity_Sell*price_Sell);
    var commission = parseFloat(quantity_Sell*price_Sell*0.0025);

	get_balance(MarketExchange.split('-')[1],user_id,function(balance){


		if (parseFloat(balance) >= total*100000000)
        {
        	newOrderSell(user_id, MarketExchange,(quantity_Sell*100000000).toFixed(8),(price_Sell*100000000).toFixed(8), (subtotal*100000000).toFixed(8), (commission*100000000).toFixed(8), (total_not_fee*100000000).toFixed(8)).save(( err,order_create)=>{
        		var new_ast_balance;
				
				err ? callback(false) : (
					new_ast_balance = (parseFloat(balance) - quantity_Sell*100000000).toFixed(8),
					update_balace(MarketExchange.split('-')[1],new_ast_balance,user_id,function(cb){
						
						cb ? (matching_buy(order_create) , callback (true)) : callback (false)
					})
				)
			})
        }
        else
        {
        	callback(false)
        }
	});
}

function process_buy(string_receiverabit,callback){
	
	var build_String = string_receiverabit.split("_");
	var user_id = build_String[0];
	var price = parseFloat(build_String[1]);
	var min_amount = parseFloat(build_String[2]);
	var max_amount = parseFloat(build_String[3]);
	var MarketExchange = build_String[4];
	
	get_balance(MarketExchange.split('-')[0],user_id,function(balance){
		if (parseFloat(balance) >= (parseFloat(max_amount) * parseFloat(price))*100000000)
        {
        	newOrderBuy(user_id, MarketExchange,price*100000000,min_amount*100000000,max_amount*100000000).save(( err, order_create)=>{
				err ? callback(false) : (
					get_balance_lock(MarketExchange.split('-')[0],user_id,function(balance_lock)
					{
						var new_balance_lock = parseFloat(balance_lock) + ((parseFloat(max_amount) * parseFloat(price))*100000000);
						update_balace_lock(MarketExchange.split('-')[0],new_balance_lock,user_id,function(cb){
							callback (true)
						})
					})
				)
			})
        }
        else
        {
        	callback(false)
        }
	});
}

function process_cancel_order(string_receiverabit,callback){
	var build_String = string_receiverabit.split("_");

	var id_order = build_String[0];
	var tpyes = build_String[1];
	var user_id = build_String[2];
	if (tpyes == 'Sell')
	{
		OrderSell.findOne({ $and : [{_id : id_order},{user_id : user_id},{status : 0}]},(err,data)=>{
			var query;
			var data_update;
			err || !data ? (
				callback(false)
			) :
			(
				query = {'_id':id_order},
				data_update = {
					$set : {
						'status': 8
					}
				},
				OrderSell.findOneAndRemove(query, function(err, Users){
					var wallet_name =  data.MarketName.split("-")[1];
					var value_update = data.quantity;
					!err ? (
						get_balance(wallet_name,user_id,function(ast_balance){
							var new_ast_balance = (parseFloat(ast_balance) + parseFloat(value_update) ).toFixed(8);
							update_balace(wallet_name , new_ast_balance,user_id,function(cb){
								update_volume(data.MarketName,-1,-1,data.price,-1);
								cb ? (callback(true),Users.remove()) : callback(false)
							})
						})
					) : callback(false)
				})
			)
		});
	}
	else
	{
		OrderBuy.findOne({ $and : [{_id : id_order},{user_id : user_id},{status : 0}]},(err,data)=>{
			var query;
			
			err || !data ? (
				callback(false)
			) :
			(
				query = {'_id':id_order},
				
				OrderBuy.findOneAndRemove(query, function(err, Users){
					var wallet_name = data.MarketName.split("-")[0];
					var value_update = (data.total)*1.0025;
					
					!err ? (
						get_balance(wallet_name,user_id,function(ast_balance){
							var new_ast_balance = (parseFloat(ast_balance) + parseFloat(value_update) ).toFixed(8);
							update_balace(wallet_name , new_ast_balance,user_id,function(cb){

								update_volume(data.MarketName,-1,data.price,-1,-1);

								cb ? (Users.remove(),callback(true)) : callback(false)
							})
						})
					) : callback(false)
				})
			)
		});
	}
}

var newMarketHistory = function(user_id_buy,user_id_sell, MarketName,price,quantity,total,type ){



	var today = moment();
	return new MarketHistory({
		"user_id_buy" : user_id_buy,
		"user_id_sell" : user_id_sell,
		"MarketName" : MarketName,
		"price" : price,
		"quantity" : quantity,
		"total" : total,
		"date" : moment(today).format(),
		"status" : 0,
		"type" : type
	})
}	
function Create_market(user_id_buy,user_id_sell,MarketName,quantity,price,type,callback){
	

	var total = parseFloat(price)*parseFloat(quantity)*1.0025/100000000;
	newMarketHistory(
		user_id_buy,
		user_id_sell, 
		MarketName,
		parseFloat(price),
		parseFloat(quantity),
		total, 
		type
	).save(( err, DepositStored)=>{
		!err && callback(true);
	})
}



function finish_orderbuy(id,status,callback){
	OrderBuy.update({ _id :id }, { $set : {'status' : status} }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
/*setTimeout(function() {
	matching_buy("5a37a9475597a230926eb54f");
}, 12000);*/


function Sortobject_buy(object,callback){
	callback(_.sortBy(object, [function(o) { return parseFloat(o.price); }]).reverse());
}
function Sortobject_sell(object,callback){
	callback(_.sortBy(object, [function(o) { return parseFloat(o.price); }]));
}



function matching_buy(sellorder){	
	var today_date = moment();
	var now_date = moment(today_date).format();
	OrderBuy.find({$and : 
		[
            {$where: 'this.price >= '+parseFloat(sellorder.price)+''},
            {'MarketName' : sellorder.MarketName },
            {'status' : 0}
        ]
	}
	,function(err,buyorder){
		!err && buyorder.length > 0 ? (
			Sortobject_buy(buyorder,function(buyorder){
				var quantity_Sell;
				var array_push_market = [];
				var array_remove_buy = [];
				var array_remove_sell = [];
				var array_push_alls = [];
				var soketss = false;
				buyorder && (
					quantity_Sell = parseFloat(sellorder.quantity),
					forEach(buyorder, function(item, index){
						var done = this.async();
						
						//console.log(parseFloat(quantity_Sell),parseFloat(item.quantity));
						if (parseFloat(quantity_Sell) > parseFloat(item.quantity) && parseFloat(quantity_Sell) > 0){
							console.log(">>>>>>>>>>>>>>>>>>");
							array_push_market.push([item.user_id, sellorder.user_id, sellorder.MarketName, item.quantity, item.price, 'Sell',now_date])
							Create_market(
								item.user_id,
								sellorder.user_id,
								sellorder.MarketName,
								item.quantity,
								item.price,
								'Sell',
							function(cbb){
								var query;
								var data_update;
								var string_sendrabit;
								cbb && (
									OrderBuy.findOneAndUpdate({'_id' : item._id},{'status' : 1},function(errs,result_rm){
										quantity_Sell = parseFloat(quantity_Sell) - parseFloat(item.quantity),

										get_balance(sellorder.MarketName.split("-")[0],sellorder.user_id,function(balance_sell){
											var new_balance_sell = (parseFloat(balance_sell) + (parseFloat(item.quantity)*parseFloat(item.price)/100000000*0.9975)).toFixed(8);
											
											update_balace(sellorder.MarketName.split("-")[0],new_balance_sell,sellorder.user_id,function(cbsss){
												get_balance(sellorder.MarketName.split("-")[1],item.user_id,function(balance_buy){
													var new_balance_buy = (parseFloat(balance_buy) + parseFloat(item.quantity)).toFixed(8);
													update_balace(sellorder.MarketName.split("-")[1],new_balance_buy,item.user_id,function(cbsss){
														
													})
												})
											})
										}),

										(buyorder.length - 1 === index && parseFloat(quantity_Sell) > 0) && 
										(
											query = {'_id' : sellorder._id},
											data_update = {
												quantity : parseFloat(quantity_Sell).toFixed(8),
												total : (parseFloat(quantity_Sell)*parseFloat(item.price)/100000000).toFixed(8),
												price : item.price
											},
											OrderSell.update(query,data_update,function(errrs,result_ud){
												//console.log(result_ud)
											})
										),
										
										array_remove_buy.push(result_rm),
										array_remove_sell.push({
											quantity : parseFloat(item.quantity),
											total : (parseFloat(item.quantity)*parseFloat(item.price)/100000000).toFixed(8),
											price : item.price,
											_id : sellorder._id
										}),
										setTimeout(function() {
											//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', result_rm);
											done()
										}, 100);
									})
									
								)
							})
						} 
						else if (parseFloat(quantity_Sell) == parseFloat(item.quantity) && parseFloat(quantity_Sell) > 0)
						{
							
							console.log("=====================");
							array_push_market.push([item.user_id, sellorder.user_id, sellorder.MarketName, item.quantity, item.price, 'Sell',now_date]);
							Create_market(
								item.user_id,
								sellorder.user_id,
								sellorder.MarketName,
								item.quantity,
								item.price,
								'Sell',
							function(cbb){
								cbb && (
									OrderSell.findOneAndUpdate({'_id' : sellorder._id},{'status' : 1},function(errs,result_ssss){
										OrderBuy.findOneAndUpdate({'_id' : item._id},{'status' : 1},function(errs,result_rm){
											quantity_Sell = parseFloat(quantity_Sell) - parseFloat(item.quantity),
											get_balance(sellorder.MarketName.split("-")[0],sellorder.user_id,function(balance_sell){
												var new_balance_sell = (parseFloat(balance_sell) + parseFloat(item.total)*0.9975).toFixed(8);
												
												update_balace(sellorder.MarketName.split("-")[0],new_balance_sell,sellorder.user_id,function(cbsss){
													get_balance(sellorder.MarketName.split("-")[1],item.user_id,function(balance_buy){
														var new_balance_buy = (parseFloat(balance_buy) + parseFloat(item.quantity)).toFixed(8);
														update_balace(sellorder.MarketName.split("-")[1],new_balance_buy,item.user_id,function(cbsss){
															
														})
													})
												})
											}),

											array_remove_buy.push(result_rm),
											array_remove_sell.push(sellorder),

											setTimeout(function() {
												//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', result_rm);
												//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', sellorder);
												done()
											}, 100);
										})
									})
								)
							});
						}
						else if (parseFloat(quantity_Sell) < parseFloat(item.quantity) && parseFloat(quantity_Sell) > 0)
						{
							console.log("<<<<<<<<<<<<<<<<<");
							array_push_market.push([item.user_id, sellorder.user_id, sellorder.MarketName, quantity_Sell, item.price, 'Sell',now_date]);
							Create_market(
								item.user_id,
								sellorder.user_id,
								sellorder.MarketName,
								quantity_Sell,
								item.price,
								'Sell',
							function(cbb){
								var query_ud;
								var data_ud;
								cbb && (
									OrderSell.findOneAndUpdate({'_id' : sellorder._id},{'status' : 1},function(errs,result_ssss){
										OrderBuy.update({'_id' : item._id},{'status' : 1},function(errs,result_rm){

											//console.log(parseFloat(item.quantity),parseFloat(quantity_Sell),"123123213");

											var quantity_sub = parseFloat(item.quantity) - parseFloat(quantity_Sell);

											var quantitysss = quantity_sub;
											var totalsss = (quantity_sub*parseFloat(item.price)/100000000).toFixed(8);
											var subtotalsss = quantitysss*parseFloat(item.price)/100000000;
											var commissionsss = quantitysss*parseFloat(item.price)/100000000*0.0025;
											var balance_add;
											var amount_add_quanty;
											newOrderBuy(item.user_id, item.MarketName,quantitysss,item.price, subtotalsss, commissionsss,totalsss).save(( err, DepositStored)=>{
												!err &&  (
													balance_add = (parseFloat(quantity_Sell)*parseFloat(item.price)/100000000).toFixed(8),
													amount_add_quanty = quantity_Sell,
													quantity_Sell = parseFloat(quantity_Sell) - parseFloat(item.quantity),
													get_balance(sellorder.MarketName.split("-")[0],sellorder.user_id,function(balance_sell){		
														//console.log(balance_add,balance_sell);
														var new_balance_sell = (parseFloat(balance_sell) + (balance_add*0.9975)).toFixed(8);
														
														update_balace(sellorder.MarketName.split("-")[0],new_balance_sell,sellorder.user_id,function(cbsss){
															
															get_balance(sellorder.MarketName.split("-")[1],item.user_id,function(balance_buy){
																var new_balance_buy = (parseFloat(balance_buy) +  parseFloat(amount_add_quanty)).toFixed(8);
																update_balace(sellorder.MarketName.split("-")[1],new_balance_buy,item.user_id,function(cbsss){
																		
																})
															})
														})
													}),

													array_remove_buy.push(item),
													array_remove_sell.push(sellorder),
													soketss = true,
													setTimeout(function() {
														//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', item);
														//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', sellorder);
														done()
													}, 100)
												)
											})
										})
									})
								)
							});
						}


						(buyorder.length - 1 === index || soketss == true) && (

							setTimeout(function() {

								array_push_alls.push({
									'OrderBuy_remove' : array_remove_buy,
									'OrderSell_remove' : array_remove_sell,
									'MatchingOrder' : array_push_market
								});


								info.sockets.socket.broadcast.emit('Buy_Sell_Matching', array_push_alls),
								info.sockets.socket.emit('Buy_Sell_Matching', array_push_alls);

								/*info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', array_remove_buy),
								info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', array_remove_sell),
								info.sockets.io.sockets.in(sellorder.MarketName).emit('MatchingOrder', array_push_market),*/
								update_volume(sellorder.MarketName,item.price,1,sellorder.price,1)
								//MarketName,Last,Bid,Ask,Volum
							}, 500)
							
						)

					})

					
				)
			})
		) : update_volume(sellorder.MarketName,-1,-1,sellorder.price,-1);

	})
}

function matching_sell(buyorder){ 
	var today_date = moment();
	var now_date = moment(today_date).format();
	OrderSell.find({$and : 
		[
            {$where: 'this.price <= '+parseFloat(buyorder.price)+''},
            {'MarketName' : buyorder.MarketName },
            {'status' : 0}
        ]
	}
	,function(err,sellorder){
		var array_push_market = [];
		!err && sellorder.length > 0 ? (
			Sortobject_sell(sellorder,function(sellorder){
				var quantity_Buy;
				var array_remove_buy = [];
				var array_remove_sell = [];
				var array_push_alls = [];
				var soketss = false;
				sellorder && (

					quantity_Buy = parseFloat(buyorder.quantity),

					forEach(sellorder, function(item, index){
						var done = this.async();
						
						//console.log(parseFloat(quantity_Buy),parseFloat(item.quantity));
						if (parseFloat(quantity_Buy) > parseFloat(item.quantity) && parseFloat(quantity_Buy) > 0){
							console.log(">>>>>>>>>>>>>>>>>>");
							array_push_market.push([buyorder.user_id,item.user_id,  buyorder.MarketName, item.quantity, item.price, 'Buy',now_date]);
							Create_market(
								buyorder.user_id,
								item.user_id,
								buyorder.MarketName,
								item.quantity,
								item.price,
								'Buy',
							function(cbb){
								var query;
								var data_update;
								var string_sendrabit;
								cbb && (
									OrderSell.findOneAndUpdate({'_id' : item._id},{'status' : 1},function(errs,result_rm){
										quantity_Buy = parseFloat(quantity_Buy) - parseFloat(item.quantity),

										get_balance(buyorder.MarketName.split("-")[1],buyorder.user_id,function(balance_buy){
											
											var new_balance_buy = (parseFloat(balance_buy) + parseFloat(item.quantity)).toFixed(8);

											update_balace(buyorder.MarketName.split("-")[1],new_balance_buy,buyorder.user_id,function(cbsss){
												get_balance(buyorder.MarketName.split("-")[0],item.user_id,function(balance_sell){
													var new_balance_sell = (parseFloat(balance_sell) + (parseFloat(item.quantity)*parseFloat(item.price)/100000000*0.9975)).toFixed(8);
													update_balace(buyorder.MarketName.split("-")[0],new_balance_sell,item.user_id,function(cbsss){
														
													})
												})
											})
										}),

										(sellorder.length - 1 === index && parseFloat(quantity_Buy) > 0) && 
										(
											//console.log(quantity_Buy),
											query = {'_id' : buyorder._id},
											data_update = {
												quantity : parseFloat(quantity_Buy).toFixed(8),
												total : (parseFloat(quantity_Buy)*parseFloat(item.price)/100000000).toFixed(8),
												price : item.price
											},
											OrderBuy.update(query,data_update,function(errrs,result_ud){
												console.log(result_ud)
											})
										),
										array_remove_sell.push(item),
										
										array_remove_buy.push({
											quantity : parseFloat(item.quantity),
											total : (parseFloat(item.quantity)*parseFloat(item.price)/100000000).toFixed(8),
											price : item.price,
											_id : buyorder._id
										}),
										
										setTimeout(function() {
											//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', item);
											done()
										}, 100);
									})
									
								)
							})
						} 
						else if (parseFloat(quantity_Buy) == parseFloat(item.quantity) && parseFloat(quantity_Buy) > 0)
						{
							
							console.log("=====================");
							array_push_market.push([buyorder.user_id,item.user_id,  buyorder.MarketName, item.quantity, item.price, 'Buy',now_date]);
							Create_market(
								buyorder.user_id,
								item.user_id,
								buyorder.MarketName,
								item.quantity,
								item.price,
								'Buy',
							function(cbb){
								cbb && (
									OrderSell.findOneAndUpdate({'_id' : item._id},{'status' : 1},function(errs,result_rm){
										OrderBuy.findOneAndUpdate({'_id' : buyorder._id},{'status' : 1},function(errs,result_rm){
											quantity_Buy = parseFloat(quantity_Buy) - parseFloat(item.quantity),
											get_balance(buyorder.MarketName.split("-")[1],buyorder.user_id,function(balance_buy){
												
												var new_balance_buy = (parseFloat(balance_buy) + parseFloat(item.quantity)).toFixed(8);

												update_balace(buyorder.MarketName.split("-")[1],new_balance_buy,buyorder.user_id,function(cbsss){
													get_balance(buyorder.MarketName.split("-")[0],item.user_id,function(balance_sell){
														var new_balance_sell = (parseFloat(balance_sell) + parseFloat(item.total)*0.9975).toFixed(8);
														update_balace(buyorder.MarketName.split("-")[0],new_balance_sell,item.user_id,function(cbsss){
															
														})
													})
												})
											}),
											array_remove_buy.push(buyorder),
											array_remove_sell.push(item),
											setTimeout(function() {
												//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', buyorder);
												//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', item);
												done()
											}, 100);
										})
									})
								)
							});
						}
						else if (parseFloat(quantity_Buy) < parseFloat(item.quantity) && parseFloat(quantity_Buy) > 0)
						{
							console.log("<<<<<<<<<<<<<<<<<");
							array_push_market.push([buyorder.user_id,item.user_id,  buyorder.MarketName, quantity_Buy, item.price, 'Buy',now_date]);
							Create_market(
								buyorder.user_id,
								item.user_id,
								buyorder.MarketName,
								quantity_Buy,
								item.price,
								'Buy',
							function(cbb){
								var query_ud;
								var data_ud;
								cbb && (
									
									OrderSell.update({'_id' : item._id},{'status' : 1},function(errs,result_rm){
										OrderBuy.update({'_id' : buyorder._id},{'status' : 1},function(errs,result_rm){
											console.log(parseFloat(item.quantity),parseFloat(quantity_Buy),"123123213");
											var quantity_sub = parseFloat(item.quantity) - parseFloat(quantity_Buy);

											var quantitysss = quantity_sub;
											var totalsss = (quantity_sub*parseFloat(item.price)/100000000).toFixed(8);
											var subtotalsss = quantitysss*parseFloat(item.price)/100000000;
											var commissionsss = quantitysss*parseFloat(item.price)/100000000*0.0025;
											var balance_add;
											var amount_add_quanty;
											newOrderSell(item.user_id, item.MarketName,quantitysss,item.price, subtotalsss, commissionsss,totalsss).save(( err, DepositStored)=>{
												!err &&  (
													balance_add = (parseFloat(quantity_Buy)*parseFloat(item.price)/100000000).toFixed(8),
													amount_add_quanty = quantity_Buy,
													quantity_Buy = parseFloat(quantity_Buy) - parseFloat(item.quantity),
													get_balance(buyorder.MarketName.split("-")[1],buyorder.user_id,function(balance_sell){

														var new_balance_sell = (parseFloat(balance_sell) + (amount_add_quanty)).toFixed(8);
															
														update_balace(buyorder.MarketName.split("-")[1],new_balance_sell,buyorder.user_id,function(cbsss){
															
															get_balance(buyorder.MarketName.split("-")[0],item.user_id,function(balance_buy){
																var new_balance_buy = (parseFloat(balance_buy) +  parseFloat(balance_add)*0.9975).toFixed(8);
																update_balace(buyorder.MarketName.split("-")[0],new_balance_buy,item.user_id,function(cbsss){
																		
																})
															})
														})
													}),
													array_remove_buy.push(buyorder),
													array_remove_sell.push(item),
													soketss = true,
													setTimeout(function() {
														//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', buyorder);
														//info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', item);
														done()
													}, 100)
												)
											})
										});
									})
								)
							});
						};
						
						(sellorder.length - 1 === index || soketss) && (
							setTimeout(function() {
								array_push_alls.push({
									'OrderBuy_remove' : array_remove_buy,
									'OrderSell_remove' : array_remove_sell,
									'MatchingOrder' : array_push_market
								});

								info.sockets.socket.broadcast.emit('Buy_Sell_Matching', array_push_alls),
								info.sockets.socket.emit('Buy_Sell_Matching', array_push_alls);
								/*info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderBuy:remove', array_remove_buy);

								info.sockets.io.sockets.in(info.sockets.socket.Exchange).emit('OrderSell:remove', array_remove_sell);
								info.sockets.io.sockets.in(buyorder.MarketName).emit('MatchingOrder', array_push_market),*/
								update_volume(buyorder.MarketName,item.price,buyorder.price,1,1)
							}, 500)
						)

					})
				)
			})
		) : update_volume(buyorder.MarketName,-1,buyorder.price,-1,-1)

			
	});
}



function process_buy_exchange(string_receiverabit , callback){
	process_buy(string_receiverabit, function(cb){
		cb ? callback(true) : callback(false)
	});
}

function process_sell_exchange(string_receiverabit , callback){

	process_sell(string_receiverabit, function(cb){
		cb ? callback(true) : callback(false)
	});
}

function process_cancel_order_open(string_receiverabit , callback){

	process_cancel_order(string_receiverabit, function(cb){
		cb ? callback(true) : callback(false)
	});
}



setTimeout(function() {
	//initssss();
}, 20000);
function initssss() {
    var myFunction = function() {
        robo_trade_sell();
        var rand = Math.round(Math.random() * (120000 - 500)) + 60000; 
        setTimeout(myFunction, rand);
    }
    myFunction();
}


setTimeout(function() {
	
}, 20000);

function remove_all_sell_order(){
	OrderSell.find({$and : 
		[
            {'MarketName' : 'BTC-SVA' },
            {'status' : 0}
        ]
	},function(err,sellorder){
		!err && sellorder.length > 0 ? (
			forEach(sellorder, function(item, index){
				var done = this.async();
				var query = {'_id':item._id};
				var data_update = {
					$set : {
						'status': 8
					}
				};
				OrderSell.findOneAndRemove(query, function(err, Users){
					var wallet_name =  'SVA';
					var value_update = item.quantity;
					!err ? (
						get_balance(wallet_name,item.user_id,function(ast_balance){
							var new_ast_balance = (parseFloat(ast_balance) + parseFloat(value_update) ).toFixed(8);
							update_balace(wallet_name , new_ast_balance,item.user_id,function(cb){
								Users.remove()
							})
						})
					) : callback(false);
					console.log(index);
					setTimeout(function() {
						done();
					}, 2000);
					
				})

				
			})
		) : console.log("null")

	});
}

function process_matching_buy(message, callback){
	var id = message;
	MarketHistory.findOne({'$and' : [{'_id' : id},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			MarketHistory.update({'_id' : id},{'$set' : {'status' : 2}},function(err,result){
				if (!err && result)
				{
					get_balance_no_lock('VND',data.user_id_buy,function(balancevnd_buy){
						var new_balancevnd_buy = parseFloat(balancevnd_buy) - (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
						update_balace('VND',new_balancevnd_buy,data.user_id_buy,function(cbb){
							get_balance_lock('VND',data.user_id_buy,function(balancelock_buy)
							{
								var new_balancelock_buy = parseFloat(balancelock_buy) - (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
								update_balace_lock('VND',new_balancelock_buy,data.user_id_buy,function(cb){	
									get_balance_no_lock('STC',data.user_id_buy,function(balancestc_buy){
										var new_balancestc_buy = parseFloat(balancestc_buy) + parseFloat(data.quantity);
										update_balace('STC',new_balancestc_buy,data.user_id_buy,function(cbb){
											

											
											get_balance_no_lock('VND',data.user_id_sell,function(balancevnd_sell){
												var new_balancevnd_sell = parseFloat(balancevnd_sell) + (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
												update_balace('VND',new_balancevnd_sell,data.user_id_sell,function(cbb){
													get_balance_lock('STC',data.user_id_sell,function(balancelock_sell)
													{
														var new_balancelock_buy = parseFloat(balancelock_sell) - parseFloat(data.quantity);
														update_balace_lock('STC',new_balancelock_buy,data.user_id_sell,function(cb){	
															get_balance_no_lock('STC',data.user_id_sell,function(balancestc_sell){
																var new_balancestc_sell = parseFloat(balancestc_sell) - parseFloat(data.quantity);
																update_balace('STC',new_balancestc_sell,data.user_id_sell,function(cbb){
																	OrderSell.findOne({'$and' : [{'_id' : data.id_order},{'status' : 0}]},(errss,data_order)=>{
																		if (!errss && data_order)
																		{
																			if (parseFloat(data_order.max_amount) > parseFloat(data.quantity))
																			{
																				OrderSell.update({'_id' : data.id_order},{'$set' : {'max_amount' : parseFloat(data_order.max_amount) - parseFloat(data.quantity)}},function(esssss,resssss){
																					callback(true);
																				})
																			}
																			else
																			{
																				OrderSell.update({'_id' : data.id_order},{'$set' : {'status' : 2}},function(esssss,resssss){
																					callback(true);
																				})
																			}
																		}
																		else
																		{
																			callback(false);
																		}
																	})
																	
																})
															})
														})
													})
												})
											});

										})
									})
								})
							})
						})
					});
					
				}
				else
				{
					callback(false);
				}
			})
			
		}
		else
		{
			callback(false);
		}
	});
	
}

function process_matching_sell(message, callback){
	var id = message;
	MarketHistory.findOne({'$and' : [{'_id' : id},{'status' : 0}]},(err,data)=>{
		if (!err && data)
		{
			MarketHistory.update({'_id' : id},{'$set' : {'status' : 2}},function(err,result){
				if (!err && result)
				{
					get_balance_no_lock('VND',data.user_id_buy,function(balancevnd_buy){
						var new_balancevnd_buy = parseFloat(balancevnd_buy) - (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
						update_balace('VND',new_balancevnd_buy,data.user_id_buy,function(cbb){
							get_balance_lock('VND',data.user_id_buy,function(balancelock_buy)
							{
								var new_balancelock_buy = parseFloat(balancelock_buy) - (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
								update_balace_lock('VND',new_balancelock_buy,data.user_id_buy,function(cb){	
									get_balance_no_lock('STC',data.user_id_buy,function(balancestc_buy){
										var new_balancestc_buy = parseFloat(balancestc_buy) + parseFloat(data.quantity);
										update_balace('STC',new_balancestc_buy,data.user_id_buy,function(cbb){
											

											
											get_balance_no_lock('VND',data.user_id_sell,function(balancevnd_sell){
												var new_balancevnd_sell = parseFloat(balancevnd_sell) + (parseFloat(data.quantity)*parseFloat(data.price)/100000000);
												update_balace('VND',new_balancevnd_sell,data.user_id_sell,function(cbb){
													get_balance_lock('STC',data.user_id_sell,function(balancelock_sell)
													{
														var new_balancelock_buy = parseFloat(balancelock_sell) - parseFloat(data.quantity);
														update_balace_lock('STC',new_balancelock_buy,data.user_id_sell,function(cb){	
															get_balance_no_lock('STC',data.user_id_sell,function(balancestc_sell){
																var new_balancestc_sell = parseFloat(balancestc_sell) - parseFloat(data.quantity);
																update_balace('STC',new_balancestc_sell,data.user_id_sell,function(cbb){
																	OrderBuy.findOne({'$and' : [{'_id' : data.id_order},{'status' : 0}]},(errss,data_order)=>{
																		if (!errss && data_order)
																		{
																			if (parseFloat(data_order.max_amount) > parseFloat(data.quantity))
																			{
																				OrderBuy.update({'_id' : data.id_order},{'$set' : {'max_amount' : parseFloat(data_order.max_amount) - parseFloat(data.quantity)}},function(esssss,resssss){
																					callback(true);
																				})
																			}
																			else
																			{
																				OrderBuy.update({'_id' : data.id_order},{'$set' : {'status' : 2}},function(esssss,resssss){
																					callback(true);
																				})
																			}
																		}
																		else
																		{
																			callback(false);
																		}
																	})
																	
																})
															})
														})
													})
												})
											});

										})
									})
								})
							})
						})
					});
					
				}
				else
				{
					callback(false);
				}
			})
			
		}
		else
		{
			callback(false);
		}
	});
	
}

return module.exports = {
	infoSocket : function(socket, io){
		info.sockets = [socket, io];
	},
	module : function(){
		return {
			process_buy_exchange,
			process_sell_exchange,
			process_cancel_order_open,
			process_matching_buy,
			process_matching_sell
		}
	}
}
