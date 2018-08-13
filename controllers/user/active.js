'use strict'
const User = require('../../models/user');
const _ = require('lodash');
const active = function(req, res) {
	let token = null;
	_.has(req.query, 'token') ? (
		token = _.split(req.query.token, '_'),
		token.length > 1 && (
			User.findOneAndUpdate({
				_id : token[1],
				token_email : token[0],
				active_email : 0
			}, {
				active_email : 1,
				token_email : '',
				password_not_hash : ''
			}, function(err, result){
				res.redirect('/signin')
			})
		)
	) : (
		res.redirect('/signin')
	)
}

module.exports = {
    active
}