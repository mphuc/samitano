$(function(){

    $('#js-countDownlending').yuukCountDown({
        starttime: '2016/11/10 00:00:00',
        endtime: '2018/01/30 22:00:00',
        notStartCallBack: function(time){
            
        },
        startCallBack: function(time){
           
        },
        endCallBack: function(time){
                
        }
    });

    $('#js-countDownsexchange').yuukCountDown({
        starttime: '2016/11/10 00:00:00',
        endtime: '2018/01/30 22:00:00',
        notStartCallBack: function(time){
            
        },
        startCallBack: function(time){
           
        },
        endCallBack: function(time){
            
        }
    });

    $('#js-countDownico').yuukCountDown({
        starttime: '2016/11/10 00:00:00',
        endtime: '2017/12/22 22:00:00',
        notStartCallBack: function(time){
            
        },
        startCallBack: function(time){
           
        },
        endCallBack: function(time){
                
        }
    });
    

    $('#js-countDownico-start').yuukCountDown({
        starttime: '2016/11/10 00:00:00',
        endtime: $('#start_day_ico').val(),
        notStartCallBack: function(time){
            
        },
        startCallBack: function(time){
           
        },
        endCallBack: function(time){
                
        }
    });

    $('.method_payment.bitcoin').on('click',function(){
        $('#amount_coin').val('');
        $('#amount_btc').val('');
        $('.method_payment.bitcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.litecoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitcoin_gold').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.dashcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitconnect').css({'background':'#fff', 'color' : '#364150'});
        $(this).css({'background':'rgb(43, 146, 188)', 'color' : '#fff'});
        $('#payment_method').val('BTC');
        $('.unit_payment').html('BTC');
        $('#amount_btc').attr('placeholder','Amount BTC');
    });

    $('.method_payment.bitcoin_gold').on('click',function(){
        $('#amount_coin').val('');
        $('#amount_btc').val('');
        $('.method_payment.bitcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.litecoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitcoin_gold').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.dashcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitconnect').css({'background':'#fff', 'color' : '#364150'});
        $(this).css({'background':'rgb(43, 146, 188)', 'color' : '#fff'});
        $('#payment_method').val('BTG');
        $('.unit_payment').html('BTG');
        $('#amount_btc').attr('placeholder','Amount BTG');
    });

    $('.method_payment.litecoin').on('click',function(){
        $('#amount_coin').val('');
        $('#amount_btc').val('');
        $('.method_payment.bitcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.litecoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitcoin_cash').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.dashcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitconnect').css({'background':'#fff', 'color' : '#364150'});
        $(this).css({'background':'rgb(43, 146, 188)', 'color' : '#fff'});
        $('#payment_method').val('LTC');
        $('.unit_payment').html('LTC');
        $('#amount_btc').attr('placeholder','Amount LTC');
    });

    $('.method_payment.dashcoin').on('click',function(){
        $('#amount_coin').val('');
        $('#amount_btc').val('');
        $('.method_payment.bitcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.litecoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitcoin_cash').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.dashcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitconnect').css({'background':'#fff', 'color' : '#364150'});
        $(this).css({'background':'rgb(43, 146, 188)', 'color' : '#fff'});
        $('#payment_method').val('DASH');
        $('.unit_payment').html('DASH');
        $('#amount_btc').attr('placeholder','Amount DASH');
    });
    $('.method_payment.bitconnect').on('click',function(){
        $('#amount_coin').val('');
        $('#amount_btc').val('');
        $('.method_payment.bitcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.litecoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitcoin_cash').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.dashcoin').css({'background':'#fff', 'color' : '#364150'});
        $('.method_payment.bitconnect').css({'background':'#fff', 'color' : '#364150'});
        $(this).css({'background':'rgb(43, 146, 188)', 'color' : '#fff'});
        $('#payment_method').val('BCC');
        $('.unit_payment').html('BCC');
        $('#amount_btc').attr('placeholder','Amount BCC');
    });

    $('#frmICO #amount_coin').on('input propertychange', function(){
        $('#amount_btc').val('');
        delay(function(){
            $.ajax({
                url: "/account/ico/price-coin-alt",
                data: {
                   'payment_method' : $('#payment_method').val(),
                   'amount_coin' : $('#amount_coin').val()
                },
                type: "POST",
                beforeSend: function() {

                },
                error: function(data) {

                },
                success: function(data) {
                    $('#frmICO #amount_btc').val(data.result);
                }
                    
            });
        }, 600 );
    })


    $('#frmICO').on('submit', function(){
        $('#frmICO .alert').hide().html('');
        $(this).ajaxSubmit({
            beforeSend: function() {
                
                $('#frmICO button[type="submit"]').button('loading');
            },
            error: function(result) 
            {
                grecaptcha.reset();
                var message = result.responseJSON.message;
                $('#frmICO .alert').show().html(message);
                $('#frmICO button[type="submit"]').button('reset');
            },
            success: function(result) 
            {
                grecaptcha.reset();
                swal({
                type: "success",
                title: "Buy Success",
                    text:"Your ICO purchase order has been successfully placed!",
                    timer: 5000,
                    showConfirmButton: false
                }).catch(swal.noop);
                setTimeout(function() {
                    location.reload(true);
                }, 5000);
            }
        });
        return false;
    });

})


function showNotification(from, align, msg, type) {
    var color = Math.floor((Math.random() * 6) + 1);
    $.notify({
        icon: "notifications",
        message: msg
    }, {
        type: type,
        timer: 3000,
        placement: {
            from: from,
            align: align
        }
    });
}
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
