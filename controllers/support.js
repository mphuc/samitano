'use strict'
const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const request = require('request');
const Support = require('../models/support');
const moment = require('moment');
const speakeasy = require('speakeasy');
var sha1 = require('sha1');
const bcrypt = require('bcrypt-nodejs');

const _ = require('lodash');
function Index(req,res){
	Support.find({'user_id' : req.user._id},(err,result)=>{
		res.locals.title = 'Support'
		res.locals.menu = 'support'
		res.locals.user = req.user
		res.locals.support = result
		
		res.locals.has_login = true
		res.render('account/support');
	});
}

function NewSupport(req,res){
	res.locals.title = 'New Support'
	res.locals.menu = 'support'
	res.locals.user = req.user

			res.locals.has_login = true
	res.render('account/new-support');
}
function SubmitNewSupport(req,res){

	var subject = req.body.subject;
	var message = req.body.message;
	var user = req.user;
	if ( !subject || !message)
		return res.status(404).send({message: 'Please enter enough information'});
	
	if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
        return res.status(401).send({ message : 'Please select captcha'});
    }
    const secretKey = "6LdT7jkUAAAAAHMTy6GxbUh2AxPdCpREowd2_1ZL";
    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationURL,function(error,response,body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return res.status(401).send({
                    error : 'Please select captcha'
                });
        }
        else
        {
        	var token_fogot = sha1(_.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'));
        	
        	let newSupport = new Support();
			var today = moment();
			newSupport.user_id = user._id;
			newSupport.username = user.displayName;
			newSupport.subject = subject;
			newSupport.status = 0;
			newSupport.date = moment(today).format();
			newSupport.token = token_fogot;
			newSupport.save((err)=>{
				var data_update;
				!err && (
					data_update = {
                        $push: {
                            'message': {
	                            'date': Date.now(),
	                            'username': user.displayName,
	                            'message': message,
	                            'types': 0
                            }
                        }
                    },
					Support.update({_id: newSupport._id}, data_update, function(err, Support) {
						err ? res.status(401).send({ error : 'Error NetWork' }) : res.status(200).send({ error : 'Success' })
					})
				)
			});
        }
    })
}

function ViewTicker(req,res)
{
	var token = req.params.token;
	Support.findOne({ $and : [{'user_id' : req.user._id},{'token' : token}]},(err,result)=>{
		err || !result ? res.redirect('/support.html')  :(
			res.locals.title = 'Support',
			res.locals.menu = 'support',
			res.locals.user = req.user,
			res.locals.support = result,
			res.locals.token = token,
			res.locals.has_login = true,
			res.render('account/ticker-support')
		)
	});
}
function SubmitReplySupport(req,res){

	var token = req.body.token;
	var message = req.body.message;
	var user = req.user;
	if ( !token || !message)
		return res.status(404).send({message: 'Please enter enough information'});
	
	Support.findOne({ $and : [{'user_id' : req.user._id},{'token' : token}]},(err,result)=>{

		var data_update;
		err || !result ? (res.status(404).send({message: 'Error NetWork'})) : (
			data_update = {
				$set: {
				'status' : 0,
				},
	            $push: {
	                'message': {
	                    'date': Date.now(),
	                    'username': user.displayName,
	                    'message': message,
	                    'types': 0
	                }
	            }
	        },
			Support.update({_id: result._id}, data_update, function(err, Support) {
				err ? res.status(401).send({ error : 'Error NetWork' }) : res.status(200).send({ error : 'Success' })
			})
		)
		
	});
       
}


module.exports = {
	Index,
	NewSupport,
	SubmitNewSupport,
	ViewTicker,
	SubmitReplySupport
}