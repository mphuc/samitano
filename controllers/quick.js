'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Invest = require('../models/invest');
const service = require('../services');
const moment = require('moment');
const nodemailer = require('nodemailer');
const Ticker = require('../models/ticker');
var _ = require('lodash');
const bitcoin = require('bitcoin');
const Withdraw = require('../models/withdraw');
const Deposit = require('../models/deposit');
const bcrypt = require('bcrypt-nodejs');

var sendpulse = require("sendpulse-api");
var sendpulse = require("../models/sendpulse.js");
var config = require('../config'); 
var speakeasy = require('speakeasy');
const amqp = require('amqplib/callback_api');
var API_USER_ID= 'e0690653db25307c9e049d9eb26e6365';
var API_SECRET= '3d7ebbb8a236cce656f8042248fc536e';
var TOKEN_STORAGE="/tmp/";
const sendRabimq = require('../rabbit_comfim');
const Order = require('../models/order');
const Bank = require('../models/bank');
const request = require('request');
const OrderBuy = require('../models/exchange/orderbuy').module();
const OrderSell = require('../models/exchange/ordersell').module();
const MarketHistory = require('../models/exchange/markethistory').module();
sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);



function TempalteQuick(req,res){
	
	res.locals.title = 'Mua bán STC nhanh chóng';
	res.locals.menu = 'quick';
	res.locals.user = req.user;
	
	res.locals.has_login = true;
	res.render('account/quick');
		
}

module.exports = {
	TempalteQuick
}