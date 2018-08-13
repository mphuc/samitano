'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const DEFAULT_USER_PICTURE = "/static/img/user.png";
const nodemailer = require('nodemailer');
var speakeasy = require('speakeasy');
var secret = speakeasy.generateSecret({length: 20});
var authyId = secret.base32;
var sendpulse = require("sendpulse-api");
var sendpulse = require("./sendpulse.js");

var API_USER_ID= '919a6adfb21220b2324ec4efa757ce20';
var API_SECRET= '93c3fc3e259499921cd138af50be6be3';
var TOKEN_STORAGE="/tmp/"

sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);

const UserSchema = new Schema({
    email: { type: String, unique: true, lowercase: true },
    displayName: String,
    password: { type: String }, /*select false significa que cuando se haga una peticion de el model user no nos traiga password en el json*/
    password_not_hash : { type: String },
    signupDate: { type: Date, default: Date.now() },
    lastLogin: Date,
    picture:  { type: String, default:  DEFAULT_USER_PICTURE},
    active_email : { type: Number, default: 0},
    token_email : { type: String, default: ""},
    token_changepass : { type: String, default: ""},
    amount_trading : { type: Number, default: 0},
    personal_info: {
        type: {
            firstname: { type: String, default: ""},
            lastname: { type: String, default: ""},
            birthday: { type: String, default: ""},
            gender: { type: String, default: ""},
            telephone: { type: String, default: ""},
            address: { type: String, default: ""},
            city: { type: String, default: ""},
            country: { type: String, default: ""}
        }
    },

    address: {
        type: {
            addressline1: { type: String, default: ""},
            addressline2: { type: String, default: ""},
            city: { type: String, default: ""},
            state: { type: String, default: ""},
            postcode: { type: String, default: ""},
            country: { type: String, default: ""}
        }
    },
    security: {
        type: {
            login_history: [],
            ip_whitelist: [],
            two_factor_auth: { 
                type: {
                    status: { type: String, default: "0"},
                    code: { type: String, default: authyId}
                }
            }
        }
    },
    balance: {
        type: {
            

            btc_wallet: {
                type: {
                    history: {
                        type: {
                            date: { type: Date, default: Date.now() },
                            type: { type: String, default: ""},
                            amount: { type: String, default: ""},
                            detail: { type: String, default: ""}
                        }
                    },
                    currency: { type: String , default: ""},
                    image: { type: String, default: 'coin.png' },
                    available: { type: String , default: '0'},
                    available_lock: { type: String , default: '0'},
                    pending: { type: String , default: '0'},
                    cryptoaddress: { type: String , default: ""}
                }
            },
            
            stc_wallet: {
                type: {
                    history: {
                        type: {
                            date: { type: Date, default: Date.now() },
                            type: { type: String, default: ""},
                            amount: { type: String, default: ""},
                            detail: { type: String, default: ""}
                        }
                    },
                    available: { type: String , default: '0'},
                    available_lock: { type: String , default: '0'},
                    cryptoaddress: { type: String , default: ""},
                }
            },
            vnd_wallet: {
                type: {
                    history: {
                        type: {
                            date: { type: Date, default: Date.now() },
                            type: { type: String, default: ""},
                            amount: { type: String, default: ""},
                            detail: { type: String, default: ""}
                        }
                    },
                    available: { type: String , default: '0'},
                    available_lock: { type: String , default: '0'},
                    cryptoaddress: { type: String , default: ""}
                }
            }
        }
    },
    withdraw: [],
    total_invest: { type: String, default: '0'},
    active_invest: { type: String, default: '0'},
    total_earn: { type: String, default: '0'},
    p_node: { type: String, default: '0'},
    status: { type: String, default: '0'},
    level: { type: Number, default: 0},
    btc_balance : { type: String, default: '0'},
    sva_balance : { type: String, default: '0'},
    wallet : { type: String, default: ''},
    count_sendmail : { type: String, default: ''}
 });


// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

UserSchema
  .path('displayName')
  .validate(function(displayName) {
    return displayName.length;
  }, 'User cannot be blank');
// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    return password.length;
  }, 'Password cannot be blank');

UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

UserSchema
  .path('displayName')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({displayName: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified username is already in use.');

UserSchema.post('save', function (doc) {
    sendmail(doc)
});

//send email sing up

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    let user = this
    return bcrypt.compareSync(password, user.password);
};



const sendmail = function (user){
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
}

var User = mongoose.model('User', UserSchema);
module.exports = User;