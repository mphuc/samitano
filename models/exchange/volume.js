'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

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

const Volumechema = new Schema({
	MarketName : String,
	last : String,
	bid : String,
	ask : String,
	hight : String,
	low : String,
	volume : String,
	last_last : String,
	bid_last : String,
	ask_last : String,
	hight_last : String,
	low_last : String,
	volume_last : String,
	date: { type: Date, default: Date.now() }
}).post('update', function (doc) {
	this.findOne({'_id' : this._conditions._id},function(err,result){
		info.sockets.socket.broadcast.emit('Volume:update', result);
		info.sockets.socket.emit('Volume:update', result);
	})
});

return module.exports = {
	infoSocket : function(socket, io){
		info.sockets = [socket, io];
	},
	module : function(){
		return mongoose.model('Volume', Volumechema);
	}
}