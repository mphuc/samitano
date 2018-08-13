const amqp = require('amqplib/callback_api');
const project = require('./projectRabbitmq');
const Exchangemq = require('./rabitmq/exchange').module();
const _ = require('lodash');
let amqpConn = null;

const config = require('./config');

const listWorker = ['BBL','BTC','BCH','LTC','DASH',
                    'BCC','Withdraw_BBL','Withdraw_BTC',
                    'Withdraw_BCH','Withdraw_LTC','Withdraw_DASH',
                    'Withdraw_BCC'
                    ];

function start() {
    
    amqp.connect(config.rabbit_link, function(err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 1000);
        }
        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        });
        conn.on("close", function() {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 1000);
        });

        console.log("[AMQP] connected");
        amqpConn = conn;

        whenConnected();
    });
}

function whenConnected() {
    startPublisher();

    startWorker('Withdraw_QWEVND', function(message, msg, ch) {
        project.process_withdraw_vnd(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });

    startWorker('Remove_Withdraw_QWE', function(message, msg, ch) {
        project.process_remove_withdraw(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });

    startWorker('Withdraw_QWESTC', function(message, msg, ch) {
        project.process_withdraw('STC',message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });
    

    startWorker('CreateBuy_QWE', function(message, msg, ch) {
        Exchangemq.process_buy_exchange(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });


    startWorker('MATCHING_BUY_QWE', function(message, msg, ch) {
        Exchangemq.process_matching_buy(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });

    startWorker('MATCHING_SELL_QWE', function(message, msg, ch) {
        Exchangemq.process_matching_sell(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });

    /*startWorker('COIN_STCMKS', function(message, msg, ch) {
        project.process_deposit_coin(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });
    

    
    
    startWorker('Exchange_Buy_STCMKS', function(message, msg, ch) {
        Exchangemq.process_buy_exchange(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });

    startWorker('Exchange_Sell_STCMKS', function(message, msg, ch) {

        Exchangemq.process_sell_exchange(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });

    startWorker('Cancel_Exchange_Open_STCMKS', function(message, msg, ch) {

        Exchangemq.process_cancel_order_open(message, function(cb) {
            cb ? ch.ack(msg) : ch.ack(msg);
        });
    });*/
   
}

var pubChannel = null;
var offlinePubQueue = [];

function startPublisher() {

    amqpConn.createChannel(function(err, ch) {
        ch.assertQueue('Withdraw_QWEVND', {durable: true});
        ch.assertQueue('Remove_Withdraw_QWE', {durable: true});

        ch.assertQueue('Withdraw_QWESTC', {durable: true});
        
        ch.assertQueue('CreateBuy_QWE', {durable: true});
        ch.assertQueue('MATCHING_BUY_QWE', {durable: true});
        ch.assertQueue('MATCHING_SELL_QWE', {durable: true});
        
        
        /*ch.assertQueue('Withdraw_STC_STCMKS', {durable: true});
        ch.assertQueue('BTC_STCMKS', {durable: true});
        ch.assertQueue('COIN_STCMKS', {durable: true});
       
        ch.assertQueue('Exchange_Buy_STCMKS', {durable: true});
        ch.assertQueue('Exchange_Sell_STCMKS', {durable: true});*/

        /*ch.assertQueue('Cancel_Exchange_Open_STCMKS', {durable: true});*/

        amqpConn.createConfirmChannel(function(err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function() {
            console.log("[AMQP] channel closed");
        });

        pubChannel = ch;
        while (true) {
            var m = offlinePubQueue.shift();
            if (!m) break;
            publish(m[0], m[1], m[2]);
        }
    });
    })
    
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {

    try {
        pubChannel.publish(exchange, routingKey, content, {
                persistent: true
            },
            function(err, ok) {
                if (err) {
                    console.error("[AMQP] publish", err);
                    offlinePubQueue.push([exchange, routingKey, content]);
                    pubChannel.connection.close();
                }
            });
    } catch (e) {
        console.error("[AMQP] publish", e.message);
        offlinePubQueue.push([exchange, routingKey, content]);
    }
}

// A worker that acks messages only if processed succesfully
function startWorker(jobs, callback) {
    amqpConn.createChannel(function(err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);

            

        });
        ch.on("close", function() {
            console.log("[AMQP] channel closed");
        });
        ch.prefetch(1);
        ch.assertQueue("", {
            durable: true
        }, function(err, _ok) {
            if (closeOnErr(err)) return;
            ch.consume(jobs, function(msg) {
                callback(msg.content.toString(), msg, ch);


            }, {
                noAck: false
            });
            console.log("Worker " + jobs + " is started");
        });

    });
}


function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

module.exports = {
    start,
    publish
}