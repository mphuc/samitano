// 'use strict';
const Ticker = require('../models/ticker');
const IcoSum = require('../models/icosum');
const request = require('request');
const mongoose = require('mongoose');

function onDisconnect(socket) {
}

function onConnect(socket,io) {
 
	socket.on('info', function (data) {
		console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
	});
	
	require('../models/exchange/orderbuy').infoSocket(socket, io);
	require('../models/exchange/ordersell').infoSocket(socket, io);
	require('../models/exchange/markethistory').infoSocket(socket, io);
	require('../models/exchange/volume').infoSocket(socket, io);
	require('../rabitmq/exchange').infoSocket(socket, io);
	require('../rabitmq/exchange_process').infoSocket(socket, io);

}

module.exports = function (io) {
  	
  	io.on('connection', function (socket) {
	    //join Room
  		socket.on('Create-Room-Exchange', (data)=>{
			socket.join(data);
			socket.Exchange = data;
		});


	    socket.on('disconnect', function () {

	    	
	      	onDisconnect(socket);
	    });

		    // Call onConnect.
	    onConnect(socket,io);
	    
  	});
};

/*module.exports = function(io){
	io.on('connection', (socket)=>{

	
		socket.on('Create-Room-Exchange', (data)=>{
			socket.join(data);
			socket.Exchange = data;
		});
		
		
		socket.on('submit-sell-client', (data)=>{
			io.sockets.in(socket.Exchange).emit('submit-sell-server', data); // all
		});
		
		socket.on('submit-buy-client', (data)=>{
			io.sockets.in(socket.Exchange).emit('submit-buy-server', data);
			
		});

		socket.on('Cancel-order-buy-client', (data)=>{

			console.log(socket.Exchange);

			io.sockets.in(socket.Exchange).emit('Cancel-order-buy-server', data);
		});

		socket.on('Cancel-order-sell-client', (data)=>{
			io.sockets.in(socket.Exchange).emit('Cancel-order-sell-server', data);
		});


		
	
	})

}*/