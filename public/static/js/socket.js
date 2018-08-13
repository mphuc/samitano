var socket = io.connect('http://localhost:5969',{ 'forceNew': true })
socket.on('dataTicker', (data)=>{
	$('.price_lec_usd').html('($'+data.bbl_usd+')');
    $('.price_lec_btc').html(data.bbl_btc+' BTC');
    $('.price_btc_usd').html('$'+data.btc_usd);
    $('#rate_coin').val(data.bbl_usd);
    $('#ast_btc').val(data.bbl_btc);
    $('#btc_usd').val(data.btc_usd);
    $('.price_ast_usd').html(data.bbl_usd);
    $('.price_bbl_bch').html(data.bbl_bch+' BCH');
	return false; 
});
socket.emit('getTicer', 'payload');