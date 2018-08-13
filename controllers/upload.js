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
const request = require('request');
sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);

const fs = require('fs')
const multer = require('multer')
const fileType = require('file-type')
const upload = multer({
    dest:'public/upload/', 
    limits: {fileSize: 2000000, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {

            return callback(new Error('Only Images are allowed !'), false)
        }
        callback(null, true);
    }
}).single('image')

function UploadImage(req,res){
	upload(req, res, function (err) {
        if (err) {
            res.status(400).json({message: err.message})

        } else {
            let path = `public/upload/${req.file.filename}`
            res.status(200).json({message: 'Image Uploaded Successfully !', path: path})
        }
    })
}
module.exports = {
	UploadImage
	
}