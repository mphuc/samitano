'use strict';


$(function() {
   


    var name_coin = $('#_NAMECOIN_').val();
    var exchange = $('#_EXCHANGE_').val();

    var socket = io.connect('http://127.0.0.1:5988',{ 'forceNew': true })
    
    socket.on('connect', function(){
        $('.soket-status i').css({'color' : '#468847'});
        $('.soket-status span').html('Socket Status = Connected');
    });
   
    socket.on('disconnect', function(){
        $('.soket-status i').css({'color' : '#b94a48'});

    });


    socket.emit('Create-Room-Exchange', name_coin+'-'+exchange);
    socket.on('connect_failed', function (data) {
        console.log(data || 'connect_failed');
    });
    
    $('.hidden_js').show();

    var loading_button_start = function (element){
        $(element).find('i').show();
        $(element).find('confirm').html('Loading...');
        $(element).attr('disabled','disabled');        
    }

    var loading_button_stop = function (element){
        $(element).find('i').hide();
        $(element).find('confirm').html('Confirm');
        $(element).removeAttr("disabled");        
    }

    load_ticker();
    

    $('#form_Buy_exchange input[name="quantity_Buy"]').on('focusout',function(){
        var quantity_Buy = parseFloat($('#form_Buy_exchange input[name="quantity_Buy"]').val()).toFixed(8);
        $(this).val(quantity_Buy);
    })

    $('#form_Buy_exchange input[name="price_Buy"]').on('focusout',function(){
        var quantity_Buy = parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val());
        $(this).val(quantity_Buy);
    })

    $('#form_Buy_exchange input[name="total_Buy"]').on('focusout',function(){
        var quantity_Buy = parseFloat($('#form_Buy_exchange input[name="total_Buy"]').val());
        $(this).val(quantity_Buy);
    })

    $('#form_Sell_exchange input[name="quantity_Buy"]').on('focusout',function(){
        var quantity_Buy = parseFloat($('#form_Sell_exchange input[name="quantity_Buy"]').val()).toFixed(8);
        $(this).val(quantity_Buy);
    })

    $('#form_Sell_exchange input[name="price_Buy"]').on('focusout',function(){
        var quantity_Buy = parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val());
        $(this).val(quantity_Buy);
    })

    $('#form_Sell_exchange input[name="total_Buy"]').on('focusout',function(){
        var quantity_Buy = parseFloat($('#form_Sell_exchange input[name="total_Buy"]').val());
        $(this).val(quantity_Buy);
    })

    $('#form_Buy_exchange input[name="quantity_Buy"]').on('input propertychange',function(){
        var quantity_Buy;
        var price_Buy;
        var fee;
        parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val()) > 0 && (
            quantity_Buy = parseFloat($('#form_Buy_exchange input[name="quantity_Buy"]').val()),
            price_Buy = parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val()),
            fee = 1.0025,
            $('#form_Buy_exchange input[name="total_Buy"]').val((quantity_Buy*price_Buy*fee))
        )
    })

    $('#form_Buy_exchange input[name="price_Buy"]').on('input propertychange',function(){
            
        var quantity_Buy;
        var price_Buy;
        var fee;
        var total_Buy;
        parseFloat($('#form_Buy_exchange input[name="quantity_Buy"]').val()) > 0 && (

            quantity_Buy = parseFloat($('#form_Buy_exchange input[name="quantity_Buy"]').val()),
            price_Buy = parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val()),
            fee = 1.0025,
            $('#form_Buy_exchange input[name="total_Buy"]').val((quantity_Buy*price_Buy*fee))
        ) 

        parseFloat($('#form_Buy_exchange input[name="total_Buy"]').val()) > 0 && (
            
            total_Buy = parseFloat($('#form_Buy_exchange input[name="total_Buy"]').val()),
            price_Buy = parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val()),

            price_Buy > 0 && (
                fee = 1.0025,
                $('#form_Buy_exchange input[name="quantity_Buy"]').val((total_Buy/price_Buy/fee).toFixed(8))
            )            
        )
    })

    $('#form_Buy_exchange input[name="total_Buy"]').on('input propertychange',function(){
        
        var quantity_Buy;
        var price_Buy;
        var fee;
        var total_Buy;
        parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val()) > 0 && (
            total_Buy = parseFloat($('#form_Buy_exchange input[name="total_Buy"]').val()),
            price_Buy = parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val()),
            fee = 1.0025,
            $('#form_Buy_exchange input[name="quantity_Buy"]').val((total_Buy/price_Buy/fee).toFixed(8))
        )
    })





    $('#form_Sell_exchange input[name="quantity_Buy"]').on('input propertychange',function(){
        var quantity_Buy;
        var price_Buy;
        var fee;
        parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()) > 0 && (
            quantity_Buy = parseFloat($('#form_Sell_exchange input[name="quantity_Buy"]').val()),
            price_Buy = parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()),
            fee = 0.9975,
            $('#form_Sell_exchange input[name="total_Buy"]').val((quantity_Buy*price_Buy*fee))
        )
    })

    $('#form_Sell_exchange input[name="price_Buy"]').on('input propertychange',function(){
        var quantity_Buy;
        var price_Buy;
        var total_Buy;
        var fee;
        parseFloat($('#form_Sell_exchange input[name="quantity_Buy"]').val()) > 0 && (
            quantity_Buy = parseFloat($('#form_Sell_exchange input[name="quantity_Buy"]').val()),
            price_Buy = parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()),
            fee = 0.9975,
            $('#form_Sell_exchange input[name="total_Buy"]').val((quantity_Buy*price_Buy*fee))
        )


        parseFloat($('#form_Sell_exchange input[name="total_Buy"]').val()) > 0 && (
            
            total_Buy = parseFloat($('#form_Sell_exchange input[name="total_Buy"]').val()),
            price_Buy = parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()),

            price_Buy > 0 && (
                fee = 0.9975,
                $('#form_Sell_exchange input[name="quantity_Buy"]').val((total_Buy/price_Buy/fee).toFixed(8))
            )            
        )

    })

    $('#form_Sell_exchange input[name="total_Buy"]').on('input propertychange',function(){
        var quantity_Buy;
        var price_Buy;
        var fee,total_Buy;
        parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()) > 0 && (
            total_Buy = parseFloat($('#form_Sell_exchange input[name="total_Buy"]').val()),
            price_Buy = parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()),
            fee = 0.9975,
            $('#form_Sell_exchange input[name="quantity_Buy"]').val((total_Buy/price_Buy/fee).toFixed(8))
        )
    })


    $('.btn-exchnage').on('click',function(){
        $('.btn-submit-exchain').attr('disabled' ,'disabled');
        load_token();
    });

    $('#form_Buy_exchange').on('submit',function(){
        $('#total_Buy-error').hide();
        var quantity_Buy = parseFloat($('#form_Buy_exchange input[name="quantity_Buy"]').val()).toFixed(8);
        var price_Buy = parseFloat($('#form_Buy_exchange input[name="price_Buy"]').val());
        var fee = 1.0025;
        var total = (quantity_Buy*price_Buy*fee).toFixed(8);
        var subtotal = (quantity_Buy*price_Buy).toFixed(8);
        var commission = (quantity_Buy*price_Buy*0.0025).toFixed(8);

        if (parseFloat(total) < 0.0005)
        {
            $('#total_Buy-error').show();
            return false;
        }
        else
        {

            $('#Form-submit-buy-exchange .error_submit_buy').hide();
            $('#Form-submit-buy-exchange input[name="quantity"]').val(quantity_Buy);
            $('#Form-submit-buy-exchange input[name="price"]').val(price_Buy);

            $('#Form-submit-buy-exchange input[name="subtotal"]').val(subtotal);
            $('#Form-submit-buy-exchange input[name="commission"]').val(commission);
            $('#Form-submit-buy-exchange input[name="total"]').val(total);

            $('#modal_buy_Exchange').modal();
            return false;
        }
    });


    $('#form_Sell_exchange').on('submit',function(){

        $('#total_Sell-error').hide();
        var quantity_Buy = parseFloat($('#form_Sell_exchange input[name="quantity_Buy"]').val()).toFixed(8);
        var price_Buy = parseFloat($('#form_Sell_exchange input[name="price_Buy"]').val()).toFixed(8);
        var fee = 0.9975;
        var total = (quantity_Buy*price_Buy*fee).toFixed(8);
        var subtotal = (quantity_Buy*price_Buy).toFixed(8);
        var commission = (quantity_Buy*price_Buy*0.0025).toFixed(8);

        if (parseFloat(total) < 0.0005)
        {
            $('#total_Sell-error').show();
            return false;
        }
        else
        {
            $('#Form-submit-sell-exchange .error_submit_sell').hide();
            $('#Form-submit-sell-exchange input[name="quantity"]').val(quantity_Buy);
            $('#Form-submit-sell-exchange input[name="price"]').val(price_Buy);

            $('#Form-submit-sell-exchange input[name="subtotal"]').val(subtotal);
            $('#Form-submit-sell-exchange input[name="commission"]').val(commission);
            $('#Form-submit-sell-exchange input[name="total"]').val(total);

            $('#modal_sell_Exchange').modal();
            return false;
        }

        
    });

    /*$('#form_Sell_exchange').on('submit',function(){
        $('#modal_sell_Exchange').modal();
        return false;
    })*/

    $('#Form-submit-buy-exchange').on('submit', function(){
        $('.error_submit_buy').hide();
        $('#Form-submit-buy-exchange').ajaxSubmit({
            beforeSend: function() {

                loading_button_start($('#Form-submit-buy-exchange .btn-submit-exchain'));
                
            },
            error: function(result) 
            {   
                loading_button_stop($('#Form-submit-buy-exchange .btn-submit-exchain'));
                var message = result.responseJSON.message;
                $('.error_submit_buy').html(message).show();
                $('#Form-submit-buy-exchange button[type="submit"]').button('reset');
            },
            success: function(result) 
            {
                var curent_balance = parseFloat($('#availableBaseCurrency_exchange').html()) *100000000;
                var update_balance = parseFloat($('#Form-submit-buy-exchange input[name="total"]').val()) *100000000
                var new_balance = (( curent_balance -  update_balance)/100000000).toFixed(8);
                
                $('#availableBaseCurrency_exchange').html(new_balance);
                
                loading_button_stop($('#Form-submit-buy-exchange .btn-submit-exchain'));
                $('#modal_buy_Exchange').modal('toggle');

                $.toast({
                    heading: 'Tạo mua',
                    text: 'Mua '+$('#Form-submit-buy-exchange input[name="quantity"]').val()+' '+exchange+'. Với giá '+$('#Form-submit-buy-exchange input[name="price"]').val()+' '+name_coin+'',
                    showHideTransition: 'fade',
                    icon: 'success',
                    position: 'top-right',
                    hideAfter: 5000,
                    loaderBg: '#26752a'
                })
                /*$('#form_Buy_exchange input[name="quantity_Buy"]').val('0.00000000');
                $('#form_Buy_exchange input[name="price_Buy"]').val('0.00000000');
                $('#form_Buy_exchange input[name="total_Buy"]').val('0.00000000');*/
                
            }
        });

        return false;
    });



    $('#Form-submit-sell-exchange').on('submit', function(){
        $('.error_submit_sell').hide();
        $('#Form-submit-sell-exchange').ajaxSubmit({
            beforeSend: function() {
                loading_button_start($('#Form-submit-sell-exchange .btn-submit-exchain'));
               
            },
            error: function(result) 
            {
                var message = result.responseJSON.message;
                $('.error_submit_sell').html(message).show();
                loading_button_stop($('#Form-submit-sell-exchange .btn-submit-exchain'));
            },
            success: function(result) 
            {
                var curent_balance = parseFloat($('#availableBaseCurrency_namecoin').html()) *100000000;
                var update_balance = parseFloat($('#Form-submit-sell-exchange input[name="quantity"]').val()) *100000000;
                var new_balance = (( curent_balance -  update_balance)/100000000).toFixed(8);
                
                $('#availableBaseCurrency_namecoin').html(new_balance);

                loading_button_stop($('#Form-submit-sell-exchange .btn-submit-exchain'));
                /*var quantity = $('#form_Sell_exchange input[name="quantity_Buy"]').val();
                var price = $('#form_Sell_exchange input[name="price_Buy"]').val();
                var total = $('#form_Sell_exchange input[name="total_Buy"]').val();

                socket.emit('submit-sell-client', {'quantity' : quantity,'price' : price, 'total' : total});
                */
                $('#modal_sell_Exchange').modal('toggle');

                $.toast({
                    heading: 'Tạo bán',
                    text: 'Bán '+$('#Form-submit-sell-exchange input[name="quantity"]').val()+' '+exchange+'. Với giá '+$('#Form-submit-sell-exchange  input[name="price"]').val()+' '+name_coin+'',
                    showHideTransition: 'fade',
                    icon: 'success',
                    position: 'top-right',
                    hideAfter: 5000,
                    loaderBg: '#26752a'
                })

                /*$('#form_Sell_exchange input[name="quantity_Buy"]').val('0.00000000');
                $('#form_Sell_exchange input[name="price_Buy"]').val('0.00000000');
                $('#form_Sell_exchange input[name="total_Buy"]').val('0.00000000');*/
               
            }
        });

        return false;
    });

    

    //error
    /*$.toast({
        heading: 'Create Order Sell',
        text: 'Sell '+$('#form_Sell_exchange input[name="quantity_Buy"]').val()+' '+name_coin+'. Price '+$('#form_Sell_exchange  input[name="price_Buy"]').val()+' '+exchange+'',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'top-right',
        hideAfter: 5000000,
        loaderBg: '#c12f18'
    })*/


    //matching
    /*$.toast({
        heading: 'Create Order Sell',
        text: 'Sell '+$('#form_Sell_exchange input[name="quantity_Buy"]').val()+' '+name_coin+'. Price '+$('#form_Sell_exchange  input[name="price_Buy"]').val()+' '+exchange+'',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'top-right',
        hideAfter: 10000000000000,
        loaderBg: '#248e53'
    })*/
    
    /*$.toast({
        heading: 'Create Order Sell',
        text: 'Sell 231231232 12 3 123 12 123 312',
        showHideTransition: 'fade',
        icon: 'success',
        position: 'top-right',
        hideAfter: 50000,
        loaderBg: '#087196'
    })*/
    /*load_order_buy_exchange(name_coin+'-'+exchange);
    load_order_sell_exchange(name_coin+'-'+exchange);
    load_order_opens(name_coin+'-'+exchange);*/

    

    function load_token(){
        $.ajax({
            url: "/token_crt",
            data: {},
            type: "GET",
            beforeSend: function() {},
            error: function(data) {},
            success: function(data) {
                $('.token_crt').val(data.token);
                $('.btn-submit-exchain').removeAttr('disabled' ,'disabled');
            }
        });
    }

    function load_order_buy_exchange(MarketName) {
        $.ajax({
            url: "/Market/loadorder-exchange-buy?MarketName="+MarketName+"",
            data: {},
            type: "GET",
            beforeSend: function() {
            },
            error: function() {},
            success: function(data) {
                var html = `<div class="table-exchanges"> <table id="list-buy-exchange" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th class="text-center"><i class="fa fa-plus"></i></th> <th>TOTAL</th> <th>SIZE (`+$('#_NAMECOIN_').val()+`) </th> <th>ASK (`+$('#_EXCHANGE_').val()+`)</th> <th><i class="fa fa-star"></i></th> </tr> </thead> <tbody> </tbody> </table> </div> `;
                $('#order-buy-exchange').html(html);
                $('#list-buy-exchange').DataTable({
                    "order": [
                        [3, "desc"]
                    ],
                    autoWidth: false,
                    searching: false,
                    ordering: true,
                    responsive: true,
                    lengthChange: false,
                    destroy: true,
                    paging: true,
                    info: false,
                    data: data.result,
                    columns: [{
                        data: 'buy'
                    }, {
                        data: 'total'
                    }, {
                        data: 'quantity'
                    },
                     {
                        data: 'price'
                    }
                    , {
                        data: ''
                    }]
                });
                click_order_buy_item();
            }

        });
        
    }

    function click_order_buy_item(){
        $('.click_order_buy_item').on('click',function(){
            
            var data_click = $(this).data('click').split("-");
            var quantity_Buy = data_click[0];
            var price_Buy = data_click[1];
            
            var fee = 1.0025;
            $('#form_Buy_exchange input[name="quantity_Buy"]').val(quantity_Buy);
            $('#form_Buy_exchange input[name="price_Buy"]').val(price_Buy);
            $('#form_Buy_exchange input[name="total_Buy"]').val((quantity_Buy*price_Buy*fee));
        
           
        }) 
    }

    function click_order_sell_item(){
        $('.click_order_sell_item').on('click',function(){
            
            var data_click = $(this).data('click').split("-");
            var quantity_Buy = data_click[0];
            var price_Buy = data_click[1];
            var fee = 0.9975;
            $('#form_Sell_exchange input[name="quantity_Buy"]').val(quantity_Buy);
            $('#form_Sell_exchange input[name="price_Buy"]').val(price_Buy);
            $('#form_Sell_exchange input[name="total_Buy"]').val((quantity_Buy*price_Buy*fee));
             
            

        }) 
    }

    function load_order_sell_exchange(MarketName) {
        $.ajax({
            url: "/Market/loadorder-exchange-sell?MarketName="+MarketName+"",
            data: {},
            type: "GET",
            beforeSend: function() {
            },
            error: function() {},
            success: function(data) {
                var html = `<div class="table-exchanges"> <table id="list-sell-exchange" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th class="text-center"><i class="fa fa-plus"></i></th> <th>TOTAL</th> <th>SIZE (`+$('#_NAMECOIN_').val()+`) </th> <th>BID (`+$('#_EXCHANGE_').val()+`)</th> <th><i class="fa fa-star"></i></th> </tr> </thead> <tbody> </tbody> </table> </div> `;
                $('#order-sell-exchange').html(html);
                $('#list-sell-exchange').DataTable({
                    "order": [
                        [3, "desc"]
                    ],
                    autoWidth: false,
                    searching: false,
                    ordering: true,
                    responsive: true,
                    lengthChange: false,
                    destroy: true,
                    paging: true,
                    info: false,
                    data: data.result,
                    columns: [{
                        data: 'sell'
                    }, {
                        data: 'total'
                    }, {
                        data: 'quantity'
                    },
                     {
                        data: 'price'
                    }
                    , {
                        data: ''
                    }]
                });
                click_order_sell_item();
            }
        });
    }

    function load_order_opens(MarketName) {
        $.ajax({
            url: "/Market/load-order-open?MarketName="+MarketName+"",
            data: {},
            type: "GET",
            beforeSend: function() {
            },
            error: function() {},
            success: function(data) {
                var html = `<div class="table-exchanges"> <table id="list-orderpen-exchange" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Open Date</th> <th>Type</th> <th>BID/ASK</th> <th>Unit Total `+$('#_NAMECOIN_').val()+`</th> <th>Actual Rate </th> <th>Estimated Total `+$('#_EXCHANGE_').val()+`</th> <th><i class="fa fa-times"></i></th> </tr> </thead> <tbody> </tbody> </table> </div> `;
                $('#order_open_exchange').html(html);
                $('#list-orderpen-exchange').DataTable({
                    "order": [
                        [1, "desc"]
                    ],
                    autoWidth: false,
                    searching: false,
                    ordering: true,
                    responsive: true,
                    lengthChange: false,
                    destroy: true,
                    paging: true,
                    info: false,
                    data: data.result,
                    columns: [
                    {
                        data: 'date'
                    }, 
                    {
                        data: 'type'
                    }, 
                    {
                        data: 'price'
                    },
                    {
                        data: 'quantity'
                    }
                    , 
                    {
                        data: 'commission'
                    }, 
                    {
                        data: 'total'
                    }
                    , 
                    {
                        data: 'remove'
                    }]
                });
                click_cancel_order_open();
            }

        });
    }

    function click_cancel_order_open(){
        $('.remove_order_exchange').on('click',function(){

            var data_click = $(this).data('click');
            
            $(this).attr('disabled','disabled');
            $(this).removeClass('fa-times');
            $(this).addClass('fa-spinner fa-spin');
           
            $.ajax({
                url: "/Market/cancel-order-open",
                data: {'data' : data_click},
                type: "POST",
                beforeSend: function() {},
                error: function(data) {},
                success: function(data) {

                    /*data_click[1] == 'Buy' ?
                        socket.emit('Cancel-order-buy-client','') : socket.emit('Cancel-order-sell-client', '')
                    load_balance(name_coin+'-'+exchange);*/
                    $.toast({
                        heading: 'Cancel Order',
                        text: 'Cancel Order Success',
                        showHideTransition: 'fade',
                        icon: 'error',
                        position: 'top-right',
                        hideAfter: 5000,
                        loaderBg: '#c12f18'
                    })

                    /*load_order_opens($('#_NAMECOIN_').val()+'-'+$('#_EXCHANGE_').val());
                    data_click[1] == 'Buy' ? load_order_buy_exchange($('#_NAMECOIN_').val()+'-'+$('#_EXCHANGE_').val()) : load_order_sell_exchange($('#_NAMECOIN_').val()+'-'+$('#_EXCHANGE_').val());*/
                }
            });
            
        }) 
    }   

    function load_balance(MarketName){
        $.ajax({
            url: "/Market/reload-balance",
            data: {'MarketName' : MarketName},
            type: "POST",
            beforeSend: function() {},
            error: function(data) {},
            success: function(data) {
                $('#availableBaseCurrency_exchange').html(data.exchange);
                $('#availableBaseCurrency_namecoin').html(data.namecoin);
            }
        });
    }

    function load_ticker(){
        $.ajax({
            url: "/Market/load-ticker",
            data: '',
            type: "POST",
            beforeSend: function() {},
            error: function(data) {},
            success: function(data) {
                $('#price_btc_usdt').html('1 BTC = $'+data.result.btc.usd);
                $('#price_eth_usdt').html('1 ETH = $'+data.result.eth.usd);
                
            }
        });
    }

    
})