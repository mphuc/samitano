'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const testSchema = new Schema({
	type : String,
	date: { type: Date, default: Date.now()},
})

.post("save", function(doc){
	console.log(info.sockets, doc);
});



return module.exports = {

	infoSocket : function(socket, io){
		info.sockets = [socket, io];
	},
	module : function(){
		return mongoose.model('testSchema', testSchema);
	}
}




