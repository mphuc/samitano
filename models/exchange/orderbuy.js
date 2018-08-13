'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const User = require('../../models/user');
var info = {
    socket: null,
    io: null,
    get sockets() {
        return {
        	socket : this.socket,
        	io : this.io
        };
    },
    set sockets (infoSocket) {
        this.socket = infoSocket[0] || null;
        this.io = infoSocket[1] || null;
    }
}

const OrderBuychema = new Schema({
	MarketName : String,
	price  : {type : Number} ,
	min_amount : {type : Number},
	max_amount : {type : Number},
	user_id : String,
	username : String,
	balance_lock : {type : Number},
	status : String, // 0 watting //1 cancel //2 fininsh // 8 remove
	date: { type: Date, default: Date.now()}
})
.post('save', function (doc) {
	
	
});
return module.exports = {
	infoSocket : function(socket, io){
		info.sockets = [socket, io];
	},
	module : function(){
		return mongoose.model('OrderBuy', OrderBuychema);
	}
}