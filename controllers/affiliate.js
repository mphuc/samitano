'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const moment = require('moment');
const _ = require('lodash');
function Indexmain(req,res){

	User.find({p_node: req.session.userId}, { displayName: 1, email: 1, signupDate: 1, _id: 0 },(err,data_user)=>{
		if (req.user.p_node != '0') {
			User.findById(req.user.p_node, (err, users)=>{
				res.locals.sponsor_mail = users.email;
				res.locals.sponsor_name = users.displayName;
				res.locals.title = 'System';
				res.locals.menu = 'affiliate';
				res.locals.user = req.user;
				res.locals.sponsor = true;
				res.locals.data_child = data_user;
				res.render('account/affiliate_main');
			})
		}else{
			res.locals.sponsor_mail = req.user.email;
			res.locals.sponsor_name = req.user.displayName;
			res.locals.title = 'System';
			res.locals.menu = 'affiliate';
			res.locals.user = req.user;
			res.sponsor = false;
			res.locals.data_child = data_user;
			res.render('account/affiliate_main');
		}
	});
	
}
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
function Treerefferal(req,res){
	res.render('account/affiliate_tree', {
		title: 'YOUR AFFILIATES',
		menu: 'affiliate',
		user: req.user
	});
}
function getRefferal(req,res){
	User.find({p_node: req.session.userId}, { displayName: 1, email: 1, signupDate: 1, _id: 0 },(err,data_user)=>{
		if(err) return res.status(500).send({message:`Error load your refferal`})
		if(!data_user) return res.status(404).send({message:`Error load your refferal`})

		var new_data_user = [];
		
		if (data_user == undefined || _.size(data_user) === 0)
			return res.status(404).send({message: 'No data'});
		
		_.forEach(data_user, function(value) {
			new_data_user.push({
				'signupDate': moment(value.signupDate).format('MM/DD/YYYY LT'),
				'email': value.email,
				'displayName': value.displayName,
			});
		});
		return res.status(200).send({refferal: new_data_user});

	})
}
module.exports = {
	Indexmain,
	Indexrefferal,
	Indexpromo,
	getRefferal,
	Treerefferal
}