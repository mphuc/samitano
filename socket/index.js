// 'use strict';
const Ticker = require('../models/ticker');
const IcoSum = require('../models/icosum');
const request = require('request');
const mongoose = require('mongoose');

function process_ticker(socket){

	let data = {};
	let price_usd;
   	let ast_coin;
	request({
        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
        json: true
    }, function(error, response, body) {
    	if (!body || error) {
    		socket.emit('dataTicker', 'error')
    	}

    	if(body.length > 0){
    		price_usd = parseFloat(body[0].price_usd);
			Ticker.findOne({},(err,data_ticker)=>{
				data.bbl_usd = parseFloat(data_ticker.price_usd);
				data.bbl_btc = parseFloat(data_ticker.price_btc);
				data.btc_usd = price_usd;
				var data_update = {
					$set : {
						'price_btc': parseFloat((data.bbl_usd)/price_usd).toFixed(8),
						'btc_usd': price_usd
					}
				};
				Ticker.findOneAndUpdate({},data_update,(err,new_data_ticker)=>{
					if (error) {
					        socket.emit('dataTicker', 'error')
					    } else {

					    	request({
						        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin-cash',
						        json: true
						    }, function(error, response, body) {
						    	
						    	if (error) {
							       socket.emit('dataTicker', 'error')
							    } else {
							    	if(body.length > 0){
							    		var bch_usd = parseFloat(body[0].price_usd);
										var bch_btc = parseFloat(body[0].price_btc);
										Ticker.findOne({},(err,data_ticker)=>{
											if (err) {
									       socket.emit('dataTicker', 'error')
										    } else {
										    	data.bbl_usd = parseFloat(data_ticker.price_usd);
												data.bbl_bch = parseFloat((data.bbl_usd)/bch_usd).toFixed(8);
												
												data.bch_usd = bch_usd;
												data.bch_btc = bch_btc;
												var data_update = {
													$set : {
														'bbl_bch': data.bbl_bch,
														'bch_usd': bch_usd
													}
												};

												Ticker.findOneAndUpdate({},data_update,(err,new_data_ticker)=>{
											
													socket.emit('dataTicker', data);
													socket.broadcast.emit('dataTicker', data);

												})
										    }
											

										})
							    	}
							    	
							    }
								
							});
					    }
					
				})

			})
    	}
		


	});
}

module.exports = function(io){
	io.on('connection', (socket)=>{

		/*socket.on('getTicer', (data)=>{
			process_ticker(socket);
			setInterval(function(){
				process_ticker(socket);
			}, 300000);
		});*/

		
	})

}