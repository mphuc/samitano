'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TokenSchema = new Schema({
	type : String,
	token : String,
	status : String,
	user_id : String,
	username : String,
	date: { type: Date, default: Date.now() }    
    
});



var Token = mongoose.model('Token', TokenSchema);
module.exports = Token;