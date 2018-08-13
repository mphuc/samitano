'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Withdrawchema = new Schema({
	
	amount : String,
	
	user_id : String,
	status : String,
	username : String,
	wallet : String,
	txid : String,
	fee : String,
	date: { type: Date, default: Date.now() },
	type : String,
	namebank : String,
	numberbank : String,
	horderbank : String,
	branchbank : String,
	contentbank : String,
	code : String
	
});



var Withdraw = mongoose.model('Withdraw', Withdrawchema);
module.exports = Withdraw;