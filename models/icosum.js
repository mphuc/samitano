'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IcoSumchema = new Schema({
    date: { type: Date, default: Date.now() },
    total: { type: String, default: '0' },
    total_today: { type: String, default: '0' }   ,
    status : { type: String, default: '0' } 
});
var IcoSum = mongoose.model('IcoSum', IcoSumchema);


module.exports =  IcoSum;