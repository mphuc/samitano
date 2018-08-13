$(function(){
    $('#CreateBuyOrder input[name="price"]').on('input propertychange',function(){
        var number = $(this).val();
        var number_replace = replaceAll(number,",","");
        $(this).val(format_number(number_replace));
    })
    
    $('#CreateSellOrder input[name="price"]').on('input propertychange',function(){
        var number = $(this).val();
        var number_replace = replaceAll(number,",","");
        $(this).val(format_number(number_replace));
    })

    $('#CreateBuyOrder button[type="submit"]').on('click',function(){
        $('#CreateBuyOrder p.error').hide();
        var price = parseFloat(replaceAll($('#CreateBuyOrder input[name="price"]').val(),",",""));
        var MarketName = $('#CreateBuyOrder input[name="MarketName"]').val();
        var min_amount = $('#CreateBuyOrder input[name="min_amount"]').val();
        var max_amount = $('#CreateBuyOrder input[name="max_amount"]').val();
        $.ajax({
            url: "/offers/create/buysubmit",
            data: {
                price : price,
                MarketName : MarketName,
                min_amount : min_amount,
                max_amount : max_amount,
                token_crt : $('#CreateBuyOrder input[name="token_crt"]').val()
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                
                $('#CreateBuyOrder button[type="submit"]').button('Đang xử lý...');
            },
            error: function(data) {
                load_token();
                $('#CreateBuyOrder button[type="submit"]').button('reset');
                var message = data.responseJSON.message;
                $('#CreateBuyOrder p.error').show().html(message);
            },
            success: function(data) {
                window.location = "/offers/create-buy/"+data._id;
            }
        });
        return false;
    });


    $('#CreateSellOrder button[type="submit"]').on('click',function(){
        $('#CreateSellOrder p.error').hide();
        var price = parseFloat(replaceAll($('#CreateSellOrder input[name="price"]').val(),",",""));
        var MarketName = $('#CreateSellOrder input[name="MarketName"]').val();
        var min_amount = $('#CreateSellOrder input[name="min_amount"]').val();
        var max_amount = $('#CreateSellOrder input[name="max_amount"]').val();
        $.ajax({
            url: "/offers/create/sellsubmit",
            data: {
                price : price,
                MarketName : MarketName,
                min_amount : min_amount,
                max_amount : max_amount,
                token_crt : $('#CreateSellOrder input[name="token_crt"]').val()
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                
                $('#CreateSellOrder button[type="submit"]').button('Đang xử lý...');
            },
            error: function(data) {
                load_token();
                $('#CreateSellOrder button[type="submit"]').button('reset');
                var message = data.responseJSON.message;
                $('#CreateSellOrder p.error').show().html(message);
            },
            success: function(data) {
                window.location = "/offers/create-sell/"+data._id;
            }
        });
        return false;
    });

   
})
function load_token(){
    $.ajax({
        url: "/token_crt",
        data: {},
        type: "GET",
        beforeSend: function() {},
        error: function(data) {},
        success: function(data) {
            $('.token_crt').val(data.token);
        }
    });
}
function format_number(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}