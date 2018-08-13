'use strict'

const captchapng = require('captchapng');

let capchaImage =  function(req,res){ 
    let number = parseInt(Math.random()*9000+10000);
    req.session.capchaCode = number;
    req.session.save( function(err) {
    	if (err) {
    		return res.satatus(500).send();
    	}
    	req.session.reload( function (err) {
    		if (err) {
	    		return res.satatus(500).send();
	    	}else{
	    		let p = new captchapng(110,20, req.session.capchaCode ); // width,height,numeric captcha 
				p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha) 
				p.color(0,0,255, 250); // Second color: paint (red, green, blue, alpha) 
				let img = p.getBase64();
				let imgbase64 = new Buffer(img,'base64');
				res.writeHead(200, {
					'Content-Type': 'image/png'
				});
				res.end(imgbase64);
	    	}
	    	
	    })
    })
}

module.exports = {
	capchaImage
}