'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Orderchema = new Schema({
	amount_coin : String,
	amount_payment : String,
	method_payment : String,
	user_id : String,
	name_node : String,
	status : String, // 0 watting //1 fininsh //3 cancel order
	username : String,
	date: { type: Date, default: Date.now() }    
});

var Order = mongoose.model('Order', Orderchema);
module.exports = Order;