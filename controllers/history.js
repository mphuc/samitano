'use strict'

const User = require('../models/user');
const moment = require('moment');
function HistoryHtml(req,res){
	res.locals.title = 'Transaction History'
	res.locals.menu = 'history'
	res.locals.user = req.user
	res.render('account/history');

	
}
function Index(req,res){
	var wallet = req.body.wallet;
	var user = req.user;
	var currency = 'BTC';
	var history = user.balance.bitcoin_wallet.history;
	if (wallet == 'LEC') {
		history = user.balance.coin_wallet.history;
		currency = 'LEC';
	}
	
	if (wallet == 'lending') {
		currency = 'USD';
		history = user.balance.lending_wallet.history;
	}
	
	var new_history = [];
	if (history == undefined)
		return res.status(200).send({history: history});
	for (var i = history.length - 1; i >= 0; i--) {
		if (history[i].type == 'sent') {
			var cls = 'text-danger';
		}else{
			var cls = 'text-info';
		}
		new_history.push({

			'date': moment(history[i].date).format('MM/DD/YYYY LT'),
			'type': history[i].type,
			'amount': history[i].amount +' '+currency,
			'detail': history[i].detail,
			'cls': cls
		});
	}

	return res.status(200).send({history: new_history});
}


module.exports = {
	Index,
	HistoryHtml
}