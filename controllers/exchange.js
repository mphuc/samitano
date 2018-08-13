'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');

function Index(req,res){
	if (req.session.userId) {
		User.findById(req.session.userId, function(err, datauser) {
	        res.render('account/exchange', {
				title: 'Exchange',
				menu: 'exchange',
				user: datauser
			});
	    });
		
	}else{
		res.render('account/exchange', {
			title: 'Exchange',
			menu: 'exchange',
			layout: 'layout_exchange.hbs'
		});
	}
	
}

module.exports = {
	Index
}