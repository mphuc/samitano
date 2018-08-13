'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Investchema = new Schema({
	date: { type: Date, default: Date.now() },
    date_finish: { type: Date},
	amount: String,
    amount_coin: String,
	interest: String,
	user_id: String,
    status: String,
    username: String,
    days: Number
    
});



var Invest = mongoose.model('Invest', Investchema);
module.exports = Invest;