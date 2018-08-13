'use strict'
const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('../config');
const amqp = require('amqplib/callback_api');
const request = require('request');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const urlSlug = require('url-slug');
var sendpulse = require("sendpulse-api");



function process_login(string_receiverabit,callback){

	var build_String = string_receiverabit.split("bitbeeline");
	var id_user = build_String[0];
	var ip_login = build_String[1];
	var user_agent = build_String[2];
	
	request({
        url: 'https://freegeoip.net/json/' + ip_login,
        json: true
    }, function(error, response, body) {
        var query = {
            _id: id_user
        };
        var data_update = {
            $push: {
                'security.login_history': {
                    'date': Date.now(),
                    'ip': body.ip,
                    'country_name': body.country_name,
                    'user_agent': user_agent
                }
            }
        };
        User.update(query, data_update, function(err, newUser) {
            !err ? (
            	//sendmail_login(id_user,body.ip,user_agent,body.country_name,function(cbbs){
            		callback(true)
            	//})
            ) : callback(false)
        });
    })
}

const sendmail_login = function (user_id,ip,user_agent,country_name,callback){
	User.findOne({'_id' : user_id},(err,user)=>{
	    var API_USER_ID= "e0690653db25307c9e049d9eb26e6365"
	    var API_SECRET= "3d7ebbb8a236cce656f8042248fc536e"
	    var TOKEN_STORAGE="/tmp/"
	    sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);
	    const answerGetter = function answerGetter(data){
	        console.log(data);
	    }
	    var today = moment();

	    var content = '<h2 style="margin: 0;margin-top: 10px;">Bitbeeline Login</h2>';
	    content += '<p style="margin: 0;margin-top: 10px;">Dear '+user.displayName+'</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">This is to notify you of a successful login to your account. </p>';
	    content += '<p style="margin: 0;margin-top: 10px;">Login Time: '+moment(today).format('MM/DD/YYYY LT')+'</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">IP Address:  '+ip+'</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">Country:  '+country_name+'</p>';
	    content += '<p style="margin: 0;margin-top: 10px;">User Agent: '+user_agent+'</p>';
	    
	    var html = '<!DOCTYPE html> <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title></title> <style> html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; } * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; } div[style*="margin: 16px 0"] { margin: 0 !important; } table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; } table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; } table table table { table-layout: auto; } img { -ms-interpolation-mode:bicubic; } *[x-apple-data-detectors], .x-gmail-data-detectors, .x-gmail-data-detectors *, .aBn { border-bottom: 0 !important; cursor: default !important; color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } .a6S { display: none !important; opacity: 0.01 !important; } img.g-img + div { display: none !important; } .button-link { text-decoration: none !important; } </style> <style> .button-td, .button-a { transition: all 100ms ease-in; } .button-td:hover, .button-a:hover { background: #555555 !important; border-color: #555555 !important; } @media screen and (max-width: 600px) { .email-container p { font-size: 17px !important; line-height: 22px !important; } } </style> </head> <body width="100%" bgcolor="#222222" style="margin: 0;     padding: 30px 0;mso-line-height-rule: exactly;"> <center style="width: 100%; background: #222222; text-align: left;"> <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> </div> <div style="max-width: 600px; margin: auto;margin-top: 20px;" class="email-container"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"> <tr> <td bgcolor="#00A2F2" align="center"> <img src="https://bitbeeline.co/assets/img/logo.png" width="120" height="" alt="alt_text" border="0" align="center" style="width: 15%; min-width: 120px; max-width: 200px; height: auto; background: #00A2F2; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; margin: auto;" class="g-img"> </td> </tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr><td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">';
	    html += content;
	    html += '</td> </tr> </table> </td> </tr></tr> <tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;"> <p style="margin: 0;">You received this message because you registered an account and accepted to use our services. Thank you</p> </td> </tr> </table> </td> </tr> </table> <table style="table-layout:fixed;width:100%;margin:0 auto;background-color:#fff; margin-top: 20px;padding: 20px;"> <tbody> <tr style="color:#799eb2; padding: 20px;"> <td style="text-align:left;padding-top:30px; padding-left: 40px">Get Bitbeeline on your phone</td> <td style="text-align:right;padding-top:30px;padding-right: 40px">Follow our updates</td> </tr> <tr> <td style="text-align:left;padding-left: 40px"> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci4.googleusercontent.com/proxy/_WaQMacvsKYTJOOGhioMR8OF_BU2S8Zym04san2sSmT62yfAPXDPLCkPttHDl1D4cINvDg=s0-d-e1-ft#http://i.imgur.com/NLjQwKZ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://bitbeeline.co" style="text-decoration:none"> <img style="width:97px;padding-right:5px" src="https://ci6.googleusercontent.com/proxy/PdRspPI2qeGPVehi1uAs-ySzy0eDR9_NgrkyvGE0GEyqpZfn8t8gv2jjm5wWp5WBi1cTfQ=s0-d-e1-ft#http://i.imgur.com/dyZhztJ.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> <td style="text-align:right;padding-right: 40px"> <a href="https://www.facebook.com/sharer/sharer.php?u=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://www.facebook.com/groups/SantaCoin/&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNHvknyoKoZhymbsaULxwxDAQXg9Lg"> <img width="40" style="padding-left:5px" src="https://imgur.com/3COJChV.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://twitter.com/intent/tweet?text=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=vi&amp;q=https://twitter.com/SANTA_COIN&amp;source=gmail&amp;ust=1509335829271000&amp;usg=AFQjCNG0JpTzMgnqtsH5bejKGUdHsTpu8Q"> <img width="40" style="padding-left:5px" src="https://imgur.com/xB1yYPh.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a target="_blank" href="https://plus.google.com/up/accounts/upgrade/?continue=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://imgur.com/q8WrSm1.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> <a href="https://www.reddit.com/submit?url=https://bitbeeline.co&title=Bitbeeline" style="text-decoration:none"> <img width="40" style="padding-left:5px" src="https://i.imgur.com/JDHVtUW.png" class="m_-6763735527889058547CToWUd CToWUd"> </a> </td> </tr> </tbody> </table> </div> </center> </body> </html>';
	    
	    var email = {
	        "html" : html,
	        "text" : "Bitbeeline",
	        "subject" : "Bitbeeline Login Notification",
	        "from" : {
	            "name" : "Bitbeeline Mailer",
	            "email" : "no-reply@bitbeeline.co"
	        },
	        "to" : [
	            {
	                "name" : "",
	                "email" : user.email
	            }
	        ]
	    };
	    
	    sendpulse.smtpSendMail(answerGetter,email);
	    callback(true);
	})
}

function process_login_rabit(string_receiverabit , callback){

	process_login(string_receiverabit, function(cb){
		cb ? callback(true) : callback(false)
	});
}

module.exports = {
	process_login_rabit
}