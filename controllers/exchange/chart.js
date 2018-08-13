'use strict'
const mongoose = require('mongoose');
const User = require('../../models/user');
const OrderBuy = require('../../models/exchange/orderbuy').module();
const OrderSell = require('../../models/exchange/ordersell').module();
const MarketHistory = require('../../models/exchange/markethistory').module();
const Chart = require('../../models/exchange/chart').module();
const Volume = require('../../models/exchange/volume').module();
const request = require('request');
const bitcoin = require('bitcoin');
const amqp = require('amqplib/callback_api');
const sendRabimq = require('../../rabbit_comfim');
const moment = require('moment');
const _ = require('lodash');
function LoadTempalate(req,res) {
	var MarketName = req.params.MarketName;
	
	res.render('exchange/chart', {
		MarketName : MarketName,
        layout: ''
    })
}

function get_json_chart(req,res){
	var MarketName = req.params.MarketName;
	var Min = req.query.min;
	console.log(Min);
	if (MarketName && Min)
	{
		var result = [];
		var date_serach;
		if (Min == '6h')
			date_serach = { $and : [{"MarketName" : MarketName},{
				    "date": { $gte: new Date((new Date().getTime() - (6 * 60 * 60 * 1000)))}
				}]
		}
		if (Min == '24h')
			date_serach = { $and : [{"MarketName" : MarketName},{
				    "date": { $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))}
				}]
		}
		if (Min == '3d')
			date_serach = { $and : [{"MarketName" : MarketName},{
				    "date": { $gte: new Date((new Date().getTime() - (24 * 3 * 60 * 60 * 1000)))}
				}]
		}
		if (Min == '1w')
			date_serach = { $and : [{"MarketName" : MarketName},{
				    "date": { $gte: new Date((new Date().getTime() - (24 * 7 * 60 * 60 * 1000)))}
				}]
		}
		if (Min == '2w')
			date_serach = { $and : [{"MarketName" : MarketName},{
				    "date": { $gte: new Date((new Date().getTime() - (24 * 14 * 60 * 60 * 1000)))}
				}]
		}


		Chart.findOne({"MarketName" : MarketName},function(err,result){
			var item_push;
			var data_push = [];
			var data_charts_search;
			if (result)
			{
				var data;
				if (Min == '6h') data = result.history6h;
				if (Min == '24h') data = result.history24h;
				if (Min == '3d') data = result.history3d;
				if (Min == '1w') data = result.history1w;
				if (Min == '2w') data = result.history2w;
				if (!err && data){
					var j = 0;
					var start_for = (data.length - 1) >= 72 ? data.length - 73 : 0;
					for (var i = start_for; i < data.length ; i++) {
						j = j+1;
						var created_on = data[i].created_on;
			        	var open = parseFloat(data[i].open);
			        	var close = parseFloat(data[i].close);
			        	var hight = parseFloat(data[i].hight);
			        	var low = parseFloat(data[i].low);
			        	var volume = parseFloat(data[i].volume);
			        	var date = data[i].date;
			            data_push.push({
			            	'created_on' : created_on,
			            	'open' : open,
			            	'close' : close,
			            	'hight' : hight,
			            	'volume' : volume,
			            	'low' : low
			            	
			            })
			            
					}
				}
			}
			res.status(200).send({
	            'result' : data_push
	        }) 
		})
	}
	
}

function LoadTempalateBook(req,res) {
	var MarketName = req.params.MarketName;
	
	res.render('exchange/chartbook', {
		MarketName : MarketName,
        layout: ''
    })
}

function GroupByPrice(object,callback){
	callback(_.groupBy(object, function(b) { return parseFloat(b.price)}));
}

function get_json_chart_book(req,res){
	var objects = [];
	var object_buy = [];
	var object_sell = [];
	OrderBuy.find({$and : [{'MarketName' : req.params.MarketName}, { 'status': 0 }]},(err,result)=>{
		if (!err && result.length > 0 )
		{

			var group = _.groupBy(result, 'price')
			var result = _.map(_.keys(group), function(e) {
			  return _.reduce(group[e], function(r, o) {
			    return r.count += + parseFloat(o.total), r
			  }, {price: e, count: 0, sum: group[e].length})
			})

			for (var i = result.length - 1; i >= 0; i--) {
				object_buy.push([(parseFloat(result[i].price)/100000000).toFixed(8), (parseFloat(result[i].count)/100000000).toFixed(8)])
			}
		}
		OrderSell.find({$and : [{'MarketName' : req.params.MarketName}, { 'status': 0 }]},(errs,result_sell)=>{
			if (!errs && result_sell.length > 0 ){
				var groups = _.groupBy(result_sell, 'price')
				var result_sell = _.map(_.keys(groups), function(e) {
				  return _.reduce(groups[e], function(r, o) {
				    return r.count += + parseFloat(o.total), r
				  }, {price: e, count: 0, sum: groups[e].length})
				})


				for (var i = result_sell.length - 1; i >= 0; i--) {
					object_sell.push([(parseFloat(result_sell[i].price)/100000000).toFixed(8), (parseFloat(result_sell[i].count)/100000000).toFixed(8)])
				}	
			}

			objects.push({
				"bids" : object_buy,
				"asks" : object_sell,
				"isFrozen":"0",
					"seq":462625960
			});

				
			res.status(200).send(
				objects[0]
		    ) 
					
		});

	});

	
					
	
			
}

module.exports = {
	LoadTempalate,
	get_json_chart,
	get_json_chart_book,
	LoadTempalateBook
}