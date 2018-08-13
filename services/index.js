'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config');

function createToken(user){
	const payload = {
		sub: user._id, /*se recomienda generar otro id diferente al del mongo por seguridad se usa este para ahorrar tiempo en el curso*/
		iat: moment().unix(), /*fecha en unix*/
		exp: moment().add(14, 'days').unix() /* expira el token en 14 days es lo recomendado para un token*/
	}

	return jwt.encode(payload, config.SECRET_TOKEN)
}

function decodeToken(token){
	const decoded = new Promise((resolve,reject)=>{
		try{
			const payload= jwt.decode(token, config.SECRET_TOKEN)

			if(payload.exp <= moment.unix()){
				reject({
					status: 401,
					message: 'El token a expirado'
				})
			}
			resolve(payload.sub)
		}catch(err){
			reject({
				status: 500,
				message: 'Invalid Token'
			})
		}
	})
	return decoded
}

module.exports = {
	createToken,
	decodeToken
}; 