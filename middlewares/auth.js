'use strict'

const services = require('../services');
const localStorage = require('localStorage');
const User = require('../models/user');
function isAuth(req,res,next){ /*como es middleware recibe un 3er params*/
	// const token = req.headers.authorization.split(' ')[1];
	// console.log(token);
		
	if(!req.session.userId){
		// return res.status(403).send({message: 'No Autorizacion'});
		return res.redirect('/signin');
	}
	
	User.findById(req.session.userId, function(err, user) {
		if (user.active_email == '0') {
			return res.redirect('/resend-active-email');	
        }
		/*if (user.security.two_factor_auth.status == '1') {
			if(!req.session.authyId){
				return res.redirect('/two-factor-auth');
			}
            	
        }*/
        req.user = user
		next()
    });

	// const token = req.headers.authorization.split(' ')[1];

	// services.decodeToken(token)
	// .then(response=>{
	// 	req.user = response
	// 	next()
	// })
	// .catch(response=>{
	// 	res.status(response.status)
	// })

}

module.exports = isAuth;