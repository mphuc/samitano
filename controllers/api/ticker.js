'use strict'
const request = require('request');

function getTicker(req,res){ 
    let ticker = [];
   	let price_ast = 0.5;
   	let price_usd;
   	let ast_coin;
   	let item;
    request({
        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
        json: true
    }, function(error, response, body) {
		price_usd = parseFloat(body[0].price_usd);
		ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
		item = {
			"ast_btc" : ast_coin
		}
        ticker.push(item);
        request({
	        url: 'https://api.coinmarketcap.com/v1/ticker/ethereum',
	        json: true
	    }, function(error, response, body) {
			price_usd = parseFloat(body[0].price_usd);
			ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
			item = {
				"ast_eth" : ast_coin
			}
			ticker.push(item);
			request({
		        url: 'https://api.coinmarketcap.com/v1/ticker/ripple',
		        json: true
		    }, function(error, response, body) {
				price_usd = parseFloat(body[0].price_usd);
				ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
				item = {
					"ast_xrp" : ast_coin
				}
				ticker.push(item);
				request({
			        url: 'https://api.coinmarketcap.com/v1/ticker/litecoin',
			        json: true
			    }, function(error, response, body) {
					price_usd = parseFloat(body[0].price_usd);
					ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
					item = {
						"ast_ltc" : ast_coin
					}
					ticker.push(item);
					request({
				        url: 'https://api.coinmarketcap.com/v1/ticker/dash',
				        json: true
				    }, function(error, response, body) {
						price_usd = parseFloat(body[0].price_usd);
						ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
						item = {
							"ast_dash" : ast_coin
						}
						ticker.push(item);
						request({
					        url: 'https://api.coinmarketcap.com/v1/ticker/neo',
					        json: true
					    }, function(error, response, body) {
							price_usd = parseFloat(body[0].price_usd);
							ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
							item = {
								"ast_neo" : ast_coin
							}
							ticker.push(item);
							request({
						        url: 'https://api.coinmarketcap.com/v1/ticker/steem',
						        json: true
						    }, function(error, response, body) {
								price_usd = parseFloat(body[0].price_usd);
								ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
								item = {
									"ast_steem" : ast_coin
								}
								ticker.push(item);
								request({
							        url: 'https://api.coinmarketcap.com/v1/ticker/bitconnect',
							        json: true
							    }, function(error, response, body) {
									price_usd = parseFloat(body[0].price_usd);
									ast_coin = parseFloat(price_ast/price_usd).toFixed(8);
									item = {
										"ast_bcc" : ast_coin
									}
									ticker.push(item);
									res.status(200).send({ticker: ticker});
							    })
						    })
					    })
				    })
			    })
		    })
	    })
    })
}

module.exports = {
	getTicker
}