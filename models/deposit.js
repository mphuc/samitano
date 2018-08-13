'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Depositchema = new Schema({
	user_id : String,
	amount : { type: Number, default: 0},
	confirm : String,
	username : String,
	wallet : String,
	txid : String,
	date: { type: Date, default: Date.now() },
	type : String,
	status : { type: Number, default: 0},

	namebank : String,
	numberbank : String,
	horderbank : String,
	branchbank : String,
	contentbank : String
	
});



var Deposit = mongoose.model('Deposit', Depositchema);
module.exports = Deposit;