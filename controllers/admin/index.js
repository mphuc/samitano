'use strict'

const User = require('../../models/user');
const Withdraw = require('../../models/withdraw');
const Ticker = require('../../models/ticker');
const Invest = require('../../models/invest');
const IcoSum = require('../../models/icosum');
const Ico = require('../../models/ico');
const Order = require('../../models/order');
const moment = require('moment');
var config = require('../../config');
const bitcoin = require('bitcoin');
var forEach = require('async-foreach').forEach;
var dateFormat = require('dateformat');
const MarketHistory = require('../../models/exchange/markethistory').module();
const OrderBuy = require('../../models/exchange/orderbuy').module();
const OrderSell = require('../../models/exchange/ordersell').module();
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

function Index(req,res){
	
}
function Dahboard(req, res){
	res.render('admin/home', {
		title: 'Dashboard',
		layout: 'layout_admin.hbs'
	});		
		
}

function ListOrderBuy(req, res){

	OrderBuy.find({ status: '0'}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else
		{
			var data_market =[];
			if (data.length > 0)
			{
				forEach(data, function(value, index){
							
					var done = this.async();
					User.findById(value.user_id, (err, user)=>{
						if (user)
						{
							data_market.push({
								'username' : user.displayName,
								'date' : value.date,
								'price' : value.price,
								'quantity' : value.quantity,
								'total' : value.total
							});
							done();
						}
						else
						{
							done();
						}
						
					});
			
					data.length - 1 === index && (
						res.render('admin/orderbuy', {
							title: 'orderbuy',
							layout: 'layout_admin.hbs',
							history: data_market
						})
					)
				})
			}
			else
			{
				res.render('admin/orderbuy', {
					title: 'orderbuy',
					layout: 'layout_admin.hbs',
					history: data_market
				})
			}

		
		}
	})
}

function ListOrderSell(req, res){

	OrderSell.find({'status' : '0'}, (err, data)=>{

		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else
		{
			var data_market =[];
			if (data.length > 0)
			{

				forEach(data, function(value, index){
							
					var done = this.async();
					User.findById(value.user_id, (err, user)=>{
						if (user)
						{
							data_market.push({
								'username' : user.displayName,
								'date' : value.date,
								'price' : value.price,
								'quantity' : value.quantity,
								'total' : value.total
							});
							done();
						}
						else
						{
							done();
						}
						
					});
					
					data.length - 1 === index && (
						res.render('admin/orderbuy', {
							title: 'orderbuy',
							layout: 'layout_admin.hbs',
							history: data_market
						})
					)
				})
			}
			else
			{
				res.render('admin/orderbuy', {
					title: 'orderbuy',
					layout: 'layout_admin.hbs',
					history: data_market
				})
			}

		
		}
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
		console.log(Client,err);
		callback(result.balance);
	})
}

function Customer(req, res){
	User.find({
		
	}, function(err, user) {

		if (err){
			
			res.render('admin/customer', {
				title: 'Customer',
				layout: 'layout_admin.hbs',
				users: []
			});
		
		}else{
			// console.log(user);
			var total_vnd = 0,total_coin = 0;
			forEach(user, function(value, index){
				
				var done = this.async();
				total_vnd += parseFloat(value.balance.vnd_wallet.available);
				total_coin += parseFloat(value.balance.stc_wallet.available);
				
				done();
				user.length - 1 === index && (
					res.render('admin/customer', {
						title: 'Customer',
						layout: 'layout_admin.hbs',
						users: user,
						total_vnd : total_vnd,
						total_coin : total_coin
					})
				)
			});

		}
	})	
}

function EditCustomer(req, res){
	User.findById(req.params.id, (err, users)=>{
		if (err) {
			res.status(500).send({'message': 'Id not found'});
		}else{
			// res.status(200).send(users);
			
				User.findById(users.p_node, (err, user_node)=>{
		        	var username_node = user_node ? user_node.displayName : ''; 
					res.render('admin/editcustomer', {
						title: 'Customer',
						layout: 'layout_admin.hbs',
						users: users,
						user_id : req.params.id,
						user_node : username_node
						
					});
				});
			
		}
	})
}



function updateUser(req, res){
	
	User.findById(req.body.uid, (err, users) => {
	 	if (err){
	 		console.log('Error');

	 	}else{
	 		 User.update(
	            {_id:users._id}, 
	            {$set : {
	            'password': users.generateHash(req.body.password)
	            }}, 
	        function(err, newUser){
	           res.status(500).send({'message': 'Update Success'});
	        })
	 	}
	 });

}
function get_balance_all_user(callback){
	User.aggregate({
    '$group' : {
        "_id" : null,
        'totalBTC': { $sum: '$balance.bitcoin_wallet.available' },
        'totalBCH': { $sum: '$balance.bitcoincash_wallet.available' },
        'totalBBL': { $sum: '$balance.coin_wallet.available' },
        'totalBTG': { $sum: '$balance.bitcoingold_wallet.available' },
        'totalLTC': { $sum: '$balance.litecoin_wallet.available' },
        'totalDASH': { $sum: '$balance.dashcoin_wallet.available' },
        'totalBCC': { $sum: '$balance.bitconnect_wallet.available' },
        'totalXVG': { $sum: '$balance.verge_wallet.available' } ,
        'totalXZC': { $sum: '$balance.zcoin_wallet.available' }   
    }
  	},(err, balance) => {
  		callback(balance);
    });
}

module.exports = {
	Index,
	Dahboard,
	Customer,
	EditCustomer,
	ListOrderBuy,
	ListOrderSell,
	updateUser
}