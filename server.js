'use strict'


const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

const server = require('http').Server(app);
const rabbitmq = require('./rabbit_comfim');
const io = require('socket.io')(server);
//require('./socket/index.js')(io);



// mongoose.connect(config.db,(err,res)=>{
// 	if(err) 
// 		return console.log(`Error al conectar a la DB: ${err}`);
// 	console.log('Connect DB lending_btc...');
	
// 	app.listen(config.port, () =>{
// 		console.log(`Server Work http://localhost:${config.port}`);
// 	});
// })

mongoose.Promise = global.Promise;
mongoose.connect(config.db, {useMongoClient: true})
	.then(() => {
		rabbitmq.start();

		require('./socket/index.js')(io);
		require('./socket/exchange.js')(io);

		server.listen(config.port, () =>{
			console.log(`Server Work http://localhost:${config.port}`);
		});
	})
	.catch(err => console.error(`Error al conectar a la DB: ${err}`));

module.export = io;