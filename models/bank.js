'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Bankchema = new Schema({
	amount_number : String,
	amount_horder : String,
	bank_name : String,
	bank_address : String
	
});



var Bank = mongoose.model('Bank', Bankchema);
module.exports = Bank;