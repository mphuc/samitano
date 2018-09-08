'use strict'

const User = require('../../models/user');

const Bank = require('../../models/bank');
const moment = require('moment');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const Order = require('../../models/order');
const nodemailer = require('nodemailer');
var sendpulse = require("sendpulse-api");

function BankTempelte(req, res){
	Bank.find({}, (err, data)=>{
		res.render('admin/bank', {
		title: 'Bank',
			layout: 'layout_admin.hbs',
			data: data,
		});
	});
}

function NewBankTempelte(req, res){
	
	res.render('admin/new_bank', {
	title: 'Tạo mới',
		layout: 'layout_admin.hbs'
	});
	
}
function SubmitNewBankTempelte(req, res){
	
	
	var amount_number = req.body.amount_number;
	var amount_horder = req.body.amount_horder;
	var bank_name = req.body.bank_name;
	var bank_address = req.body.bank_address;

	if (bank_address && amount_horder && amount_number && bank_name)
	{

		var newBank = new Bank();
	    newBank.amount_number= amount_number;
	    newBank.amount_horder= amount_horder;
	    newBank.bank_name= bank_name;
	    newBank.bank_address= bank_address;
		newBank.save( (err) => {
			res.redirect('/qwertyuiop/admin/bank')
		});
	}
	else
	{
		res.redirect('/qwertyuiop/admin/new-bank')
	}
}

function RemoveBank(req, res){
	var _id = req.params.id;
	Bank.remove({'_id' : _id},function(err,result){
		res.redirect('/qwertyuiop/admin/bank')
	})	
}

function EditBankTemplete(req, res){
	var _id = req.params.id;
	Bank.findOne({'_id' : _id},function(err,result){

		res.render('admin/edit_bank', {
		title: 'Tạo mới',
			layout: 'layout_admin.hbs',
			data : result
		});
	})	
}

function SubmitEditBankTemplete(req, res){
	var _id = req.params.id;
	var amount_number = req.body.amount_number;
	var amount_horder = req.body.amount_horder;
	var bank_name = req.body.bank_name;
	var bank_address = req.body.bank_address;
	Bank.update({'_id' : _id},{'$set' : {'amount_number' : amount_number,
		'amount_horder' : amount_horder,
		'bank_name' : bank_name,
		'bank_address' : bank_address
	}},function(err,result){
		res.redirect('/qwertyuiop/admin/bank')
	})	
}

module.exports = {
	BankTempelte,
	NewBankTempelte,
	SubmitNewBankTempelte,
	RemoveBank,
	EditBankTemplete,
	SubmitEditBankTemplete
	
}