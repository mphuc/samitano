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
const Support = require('../../models/support');
function ListSupport(req, res){
	Support.find({}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			
			res.render('admin/support', {
				title: 'Support',
				layout: 'layout_admin.hbs',
				history: data
			});
		}
	})
}
function ViewTicker(req,res)
{
	var token = req.params.token;
	Support.findOne({'token' : token},(err,result)=>{
		err || !result ? res.redirect('/qwertyuiop/admin/support')  :(

			res.render('admin/ticker-support', {
				title: 'Support',
				layout: 'layout_admin.hbs',
				token: token,
				support : result
			})
		)
	});
}
function SubmitReplySupport(req,res){

	var token = req.body.token;
	var message = req.body.message;
	var user = req.user;
	if ( !token || !message)
		return res.redirect('/qwertyuiop/admin/support/ticket/'+token+'');
	
	Support.findOne({'token' : token},(err,result)=>{

		var data_update;
		err || !result ? (res.redirect('/qwertyuiop/admin/support/ticket/'+token+'')) : (
			data_update = {
				$set: {
				'status' : 1,
				},
	            $push: {
	                'message': {
	                    'date': Date.now(),
	                    'username': 'Samitano, INC',
	                    'message': message,
	                    'types': 1
	                }
	            }
	        },
			Support.update({_id: result._id}, data_update, function(err, Support) {
				err ? res.redirect('/qwertyuiop/admin/support/ticket/'+token+'') : res.redirect('/qwertyuiop/admin/support/ticket/'+token+'')
			})
		)
		
	});
       
}

module.exports = {
	ListSupport,
	ViewTicker,
	SubmitReplySupport
}