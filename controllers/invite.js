'use strict'

const User = require('../models/user');
const moment = require('moment');
function InviteHtml(req,res){

	res.locals.sponsor_mail = req.user.displayName;

	res.locals.title = 'Invite Friends'
	res.locals.menu = 'invite'
	res.locals.user = req.user
	res.render('account/invite');

	
}

module.exports = {

	InviteHtml
}