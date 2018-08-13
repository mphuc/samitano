'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const Ticker = require('../models/ticker');
const bitcoin = require('bitcoin');
const AstClient = new bitcoin.Client({
	host: 'localhost',
	port: 19668,
	user: 'santacoinrpc',
	pass: 'ASd1Q2HEGJJPnL5knD6Ez3qHhefDtySXp66vUT1TfuEQ',
	timeout: 30000
});

function setupTicker(){
	let newTicker = new Ticker();
	newTicker.last= '0.5';
	newTicker.bid= '0.5';
	newTicker.ask= '0.5';
	newTicker.high= '0.5';
	newTicker.volume= '0.5';
	newTicker.price_usd= '0.5';
	newTicker.price_btc= '0.5';
	newTicker.save((err, investStored)=>{
		console.log(investStored);
	});
}
function getTemplateHome(req,res){
	// setupTicker();

	var affiliate = req.query.affiliate;

	console.log(affiliate);

	if (affiliate != undefined) {
		User.findOne({
		    'displayName': affiliate
		}, function(err, user) {        
			if (err){

				res.render('home/home', {
					title: 'Home',
					layout: 'layout_home.hbs'
				});
			}
			if (user){
				/*req.session.userId = user._id;
				req.user = user;*/
				res.cookie('affiliate', affiliate, {expire: 86400000 + Date.now()});
				return res.redirect('/signup');
			}else{
				return res.redirect('/');
			}
			
			
		})		
	}else{
		res.render('home/home', {
					title: 'Home',
					layout: 'layout_home.hbs'
				});
	}	
}
function getTemplateWallet(req,res){
	
	res.render('home/wallet', {
		title: 'Wallet',
		layout: 'layout_home.hbs'
	});
		
}



function howtobuy(req,res){
	res.render('home/guide', {
		title: 'A beginner\'s guide to Sfccoin',
		page: 'howtobuy',
		layout: 'layout_home.hbs'
	});
}
function guidepage1(req,res){
	res.render('home/how-do-i-start-earning-interest-with-my-bitbeeline-coin', {
		title: 'How do I start earning interest with my Sfccoin Coin?',
		page: 'how-do-i-start-earning-interest-with-my-bitbeeline-coin',
		layout: 'layout_home.hbs'
	});
}
function guidepage2(req,res){
	res.render('home/what-is-bitbeeline-mining', {
		title: 'What is Sfccoin mining?',
		page: 'what-is-Sfccoin-mining',
		layout: 'layout_home.hbs'
	});
}
function guidepage3(req,res){
	res.render('home/how-to-buy-ico-Sfccoin', {
		title: 'How to buy ICO Bitbeeline?',
		page: 'how-to-buy-ico-Sfccoin',
		layout: 'layout_home.hbs'
	});
}
function guidepage4(req,res){
	res.render('home/how-to-download-wallet', {
		title: 'How to download wallet and install wallet?',
		page: 'how-to-download-wallet',
		layout: 'layout_home.hbs'
	});
}

function newpage1(req,res){
	res.render('home/news/bitcoin-reaches-end-of-an-era-expert-blog', {
		title: 'Bitcoin Reaches End of An Era: Expert Blog',
		page: 'home/news/bitcoin-reaches-end-of-an-era-expert-blog',
		layout: 'layout_home.hbs'
	});
}
function newpage2(req,res){
	res.render('home/news/max-keiser-saudi-arabias-bin-talal-is-bitcoin-poster-boy', {
		title: 'Max Keiser: Saudi Arabia’s Bin Talal is Bitcoin ‘Poster Boy’',
		page: 'home/news/max-keiser-saudi-arabias-bin-talal-is-bitcoin-poster-boy',
		layout: 'layout_home.hbs'
	});
}
function newpage3(req,res){
	res.render('home/news/segwit2x-is-dead-long-live-bitcoin-price-hits-all-time-high-as-hard-fork-canceled', {
		title: 'SegWit2x Is Dead, Long Live Bitcoin! Price Hits All-Time High As Hard Fork Canceled',
		page: 'home/news/segwit2x-is-dead-long-live-bitcoin-price-hits-all-time-high-as-hard-fork-canceled',
		layout: 'layout_home.hbs'
	});
}


function getTemplateBlogDetail(req,res){
	res.render('home/blog_detail', {
		title: 'Blog',
		page: 'home',
		layout: 'layout_home.hbs'
	});
}
function Ico(req,res){
	res.render('home/ico', {
		title: 'Bitbeeline ICO | BBL',
		page: 'ico',
		layout: 'layout_home.hbs'
	});
}

function InfoSTC(req, res){
	res.status(200).send(data)
	// AstClient.getInfo(function(err, info) {
	//   if (err) {
	//     return console.error(err);
	//   }
	//  var moneysupply = parseInt(info.moneysupply);
	//  var block = parseInt(info.blocks);
	//  var data = {
	//  	'block': block.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
	//  	'moneysupply': moneysupply.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") 
	//  };
	
	//  res.status(200).send(data)
	// });
}


module.exports = {
	getTemplateHome,
	getTemplateBlogDetail,
	Ico,
	InfoSTC,
	howtobuy,
	guidepage1,
	guidepage2,
	guidepage3,
	guidepage4,
	newpage1,
	newpage3,
	newpage2,
	getTemplateWallet
}