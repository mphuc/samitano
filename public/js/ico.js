'use strict'
var dataCapcha = null;
var recaptchaCallback = function () {
    //getTicker();
    function getTicker(){
        $.get( "/ticker", function( data ) {
          $('#rate_coin').val(data.ast_usd);
           $('#lec_btc').val(data.ast_btc);
         $('.rate').html(data.ast_usd +' USD');
        });

        $.get( "/ico/detail", function( data ) {
            $('.progress-left').html(parseInt(data.total).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' LEC');
            $('.progress-bar').attr('style', 'width : '+data.percent+'%').html(data.percent+'%');
        });
    }



    setInterval(function() { 
        getTicker();
    }, 7000);
    
    $('.btn-join').click(function(evt) {
   
      $('html, body').animate({
         scrollTop: $('.fyp-purchase-container').offset().top
     }, 1000);
    });

    $('#amount_btc').on("change paste keyup", function() {
        var lec_btc = $('#lec_btc').val();
        var rate_coin = $('#rate_coin').val();
        var amount_btc = $('#amount_btc').val();
         $('#amount_lec').val((parseFloat(amount_btc)/parseFloat(lec_btc)).toFixed(8))
        
    
    });

     $('#amount_lec').on("change paste keyup", function() {

        var lec_btc = $('#lec_btc').val();

        var rate_coin = $('#rate_coin').val();
        var amount_lec = $('#amount_lec').val();
         $('#amount_btc').val((parseFloat(amount_lec)*parseFloat(lec_btc)).toFixed(8))
    });

     $('#IcoSubmit').click(function(e){
        console.log(dataCapcha);
        $.ajax({
            url: "/ico",
            data: $("#frmIco").serialize(),
            type: "POST",
            beforeSend: function() {
                // self.WithdrawSubmit.button('loading');           
            },
            error: function(data) {
                grecaptcha.reset();
                dataCapcha = null;
                var json = data.responseJSON;

                json.error === 'capcha' && (
                    $("#textError").text('Please select captcha')
                    // setTimeout(function() {
                    //     location.reload(true);
                    // }, 1000)
                 
                )
                json.error == 'amount' && (
                    $("#textError").html('Please enter amount >= 100 BBL and amount <= 10,000 BBL')
                )
                json.error === 'email' && (
                    $("#textError").html('Entered email does not match')
                )
                json.error === 'wallet' && (
                    $("#textError").html('Wrong address. Please try again')
                )
                json.error === 'end' && (
                    $("#textError").html('SOLD OUT! Please come back tomorrow')
                )

                // showNotification('top','right',message, 'danger');
                // self.WithdrawSubmit.button('reset');
            },
            success: function(data) {
                 $('#IcoContentSuccess').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
               
                // console.log(data);
                // $('.fyp-purchase-container').hide();
                // $('#amount_btc').val(data.amount_btc);
                    
                    var html = `
                        <div class="col-md-12 text-center">
                        <div class="box-payment">
                         <p style=" color: #4289b2; word-break: break-word;"> You are buying &nbsp; <b style=" color: #ef8a0c; ">`+data.amount_ast+`&nbsp;LEC</b> &nbsp; to address &nbsp; `+data.address_ast+`</p>
                    <p style=" color: #4289b2; ">
                        Make sure to transfer this sum exactly  &nbsp; <b style=" color: #ef8a0c; ">`+data.amount_btc+`&nbsp;BTC</b>   &nbsp; to this address. <br> 
                        <b style=" color: #ef8a0c; word-break: break-word;">`+data.address_btc+`</b>
                        </p>
                 
             
                       
                        
                         <p>
                        <img style="margin-left:-10px" src="https://chart.googleapis.com/chart?chs=225x225&amp;chld=L|0&amp;cht=qr&amp;chl=bitcoin:`+data.address_btc+`?amount=`+data.amount_btc+`">
                         </p>

                    <hr>
                  
                        <p class="text-danger text-left">Note:  We're generate an unique BTC wallet for every transaction. Please make only one transfer to this wallet.<br />The transaction requires 1 confirmation from bitcoin. To make transaction processing fast you should set the Bitcoin network commission not less than 0.0001 BTC.</br>If you do not send the correct BTC number, the transaction will not be accepted and your BTC number may be lost.</p>
                     <a href="javascript:history.go(0)" class="btn btn-flyp btn-wide btn-info"> <i class="ti-reload"></i> I have already paid </a>
                     </div>
                     </div>
                        

                        `;
                    setTimeout(function() {
                         $("#IcoContentSuccess").show().html(html);;
                    }, 2000)
                   
                 
                
               
                    
               

            }
        });
    });  
     

    grecaptcha.render("recaptcha", {
        sitekey: '6LfTIDYUAAAAAIscAJ-qcY2EkCCZLfGK3O6FPnSj',
        callback: function (data) {
            dataCapcha = data;
        }
    });
};

$(function() {
    

})
