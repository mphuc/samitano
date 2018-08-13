'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');


const SupportSchema = new Schema({
    user_id: { type: String }, 
	username: String,
	subject: { type: String }, 
    date : { type: Date, default: Date.now() },
    status : { type: String },
    token : { type: String },
	message: { type: 
        {
            date: { type: Date, default: Date.now() },
            username: { type: String, default: ""},
            message: { type: String, default: ""},
            types: { type: String, default: ""}
        } }
});
var Support = mongoose.model('Support', SupportSchema);
module.exports = Support;