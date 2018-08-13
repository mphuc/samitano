'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Profitschema = new Schema({
	package_one: [],
	package_two: [],
	package_three: [],
	package_four: []
    
});



var Profit = mongoose.model('Profit', Profitschema);
module.exports = Profit;