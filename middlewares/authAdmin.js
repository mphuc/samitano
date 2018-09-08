'use strict'

const services = require('../services');
const localStorage = require('localStorage');
const User = require('../models/user');
function isAuthAdmin(req,res,next){ /*como es middleware recibe un 3er params*/
	
	if(!req.session.userId){
		return res.redirect('/signin');
	}
	
	User.findById(req.session.userId, function(err, user) {
		
        if (req.session.userId != '5b56a2ac114f1d0b2db3bff4' && req.headers.host.split(':')[0] != 'localhost' ) {
        	return res.redirect('/signin');
        }
        req.user = user;
        
		next()
    });
}

module.exports = isAuthAdmin;