'use strict'

const mongoose = require('mongoose');
const User = require('../../models/user');

const speakeasy = require('speakeasy');
const request = require('request');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs')
const moment = require('moment');
const Invest = require('../../models/invest');
var forEach = require('async-foreach').forEach;
const getTemplateRegister = function(req, res) {

	var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
    req.session.token_crt = token_withdraw; 

    res.render('register', {
        success: req.flash('success')[0],
        errors: req.flash('error'),
        title: 'Đăng ký tài khoản',
        token : token_withdraw,
        menu : 'login',
        has_login : false,
        layout: 'default.hbs'
    });
};

const generateDataUpdate = function (authyId , secret , sponsor, callback){
	var today = moment();
	getSponsor(sponsor , function(id_sponsor){
		callback({
			$set: {
				'signupDate': moment(today).format(),
				'active_email' : 1,
				'security.two_factor_auth.code': authyId,
		        'security.two_factor_auth.status': 0,
		        'security.two_factor_auth.secret': secret,
		        'total_invest': 0,
		        'active_invest': 0,
		        'total_earn': 0,
		        'total_capitalback' : 0,
		        'p_node': id_sponsor === '' ? '0' : id_sponsor,
		        'status': 1,
		        'level': 0,
		        'balance.btc_wallet.available': 0,
		        'balance.btc_wallet.cryptoaddress': "",
		        'balance.stc_wallet.available': 0,
		        'balance.stc_wallet.available_lock': 0,
		        'balance.stc_wallet.cryptoaddress': "",
		        'balance.vnd_wallet.available': 0,
		        'balance.vnd_wallet.available_lock': 0,
		        'balance.vnd_wallet.cryptoaddress': "",
		        'txid_last': "",
		        'count_sendmail' : 0,
		        'token_changepass' : '',
		        'amount_trading' : 0
			}
		})
	});
}

const getSponsor = function(name , callback){
	User.findOne({
	    'displayName': name
	}, function(err, user) {
		err || !user ? callback('') : callback(user._id)
	})
}



const signUp = function(req, res) {

	
	let newUser = new User();
	let secret = speakeasy.generateSecret({
    	length: 8
	});
	var authyId = secret.base32;
	var email = _.trim(req.body.email);
	var username = _.trim(_.toLower(req.body.username)).replace('@', '').replace(' ', '').replace('.', '');
	var password = _.trim(req.body.password);
	var cfpassword = _.trim(req.body.cfpassword);

	var sponsor = _.trim(req.body.sponsor);
	var errors,errMongo;
	email && username && password && cfpassword ?
	(
		errors = null,
	    errMongo = [],
	   
		newUser = new User(),
	    newUser.email= _.trim(req.body.email),
	    newUser.displayName= _.trim(username),
	    newUser.password = _.trim(req.body.password) !== '' ? newUser.generateHash(req.body.password) : '',
		newUser.token_email = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
		newUser.password_not_hash = _.trim(req.body.password),
		newUser.save( (err) => {
			err ? (
	            err = err.errors,
	            _.each(err, function(value, key , i){
	                errMongo.push({
	                    param : key,
	                    msg : value.message
	                })
	            }),
	            res.status(401).send({'message' : errMongo})
	        ) : 
	        (
	            generateDataUpdate(authyId, secret , sponsor, function(data_update){
	            	User.update({_id: newUser._id}, data_update, function(err, Users) {
	            		err ? (
	            			User.remove({_id : newUser._id}) , res.status(500).send()
	            		) : (
	            		// sendmail(newUser.displayName, authyId, newUser.email),
	            		//req.session.userId = newUser._id,
	            		res.status(200).send()
	            		)
	            	})
	            })
	        )
	    })           
	) : (
            res.status(403).send('Forbidden')
        )

		 
}



module.exports = {
    getTemplateRegister,
    signUp
}