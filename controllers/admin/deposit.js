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
const Deposit = require('../../models/deposit');
function ListDeposit(req, res){
	Deposit.find({
		"user_id": {
	        "$not": {
	            "$in": ["5a55ce6590928d62738e9949"]
	        }
	    }
	}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			
			res.render('admin/deposit', {
				title: 'Deposit',
				layout: 'layout_admin.hbs',
				history: data
			});
		}
	})
}

var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'VND' && callback(parseFloat(data.balance.vnd_wallet.available)),
			name === 'BTC' && callback(parseFloat(data.balance.btc_wallet.available) ),
			name === 'STC' && callback(parseFloat(data.balance.stc_wallet.available) ) 
		) : callback (balance) 
	})
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

function DepositRecieve(req, res){
	var id = req.query.id;
	if (id) {
		Deposit.findOne({'_id':id},function(errs,result){
			if (!errs && result)
			{
				Deposit.update({'_id':id},{ $set : {'status' : 1}},function(err,resultss){
					
					get_balance(result.type,result.user_id,function(ast_balance){
						var new_ast_balance = (parseFloat(ast_balance) + parseFloat(result.amount)).toFixed(8);
						
						update_balace(result.type , new_ast_balance,result.user_id,function(cb){
							res.redirect('/qwertyuiop/admin/deposit');
						})
					})
				})
			}
			else
			{
				res.redirect('/qwertyuiop/admin/deposit');
			}
		});
		
	}
}





module.exports = {
	ListDeposit,
	DepositRecieve
}