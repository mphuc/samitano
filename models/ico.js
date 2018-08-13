'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Icochema = new Schema({
	date: { type: Date, default: Date.now() },
	amount_ast: String,
    amount_btc: String,
    amount_btc_satosi: String,
	address_btc: String,
	address_ast: String,
    fullname: String,
	email: String,
    txid: String,
    type: String,
    receive: String,
    status: { type: String, default: '0' },
    txid_ast: String
    
});



var Ico = mongoose.model('Ico', Icochema);
module.exports = Ico;