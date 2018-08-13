'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Tickerchema = new Schema({
	coin: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    btc: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: 1}
        }
    },
    bch: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    btg: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    ltc: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    dash: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    bcc: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    xvg: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    xzc: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    }
    ,
    eth: {
        type: {
            usd: { type: String, default: ""},
            btc: { type: String, default: ""}
        }
    },
    btc_usd :{ type: String, default: ""},
    sva_btc :{ type: String, default: ""},
    sva_usd :{ type: String, default: ""}

});
var Ticker = mongoose.model('Ticker', Tickerchema);
module.exports = Ticker;