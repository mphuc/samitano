$(function(){
    $('#EditBuyOrder input[name="price"]').on('input propertychange',function(){
        var number = $(this).val();
        var number_replace = replaceAll(number,",","");
        $(this).val(format_number(number_replace));
    })
    
    $('#EditSellOrder input[name="price"]').on('input propertychange',function(){
        var number = $(this).val();
        var number_replace = replaceAll(number,",","");
        $(this).val(format_number(number_replace));
    })

    $('#EditBuyOrder button[type="submit"]').on('click',function(){
        $('#EditBuyOrder p.error').hide();
        var price = parseFloat(replaceAll($('#EditBuyOrder input[name="price"]').val(),",",""));
        var MarketName = $('#EditBuyOrder input[name="MarketName"]').val();
        var min_amount = $('#EditBuyOrder input[name="min_amount"]').val();
        var max_amount = $('#EditBuyOrder input[name="max_amount"]').val();
        var id_order = $('#EditBuyOrder input[name="id_order"]').val();
        $.ajax({
            url: "/offers/edit/buy",
            data: {
                price : price,
                MarketName : MarketName,
                min_amount : min_amount,
                max_amount : max_amount,
                token_crt : $('#EditBuyOrder input[name="token_crt"]').val(),
                id_order : id_order
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                
                $('#EditBuyOrder button[type="submit"]').button('Đang xử lý...');
            },
            error: function(data) {
                load_token();
                $('#EditBuyOrder button[type="submit"]').button('reset');
                var message = data.responseJSON.message;
                $('#EditBuyOrder p.error').show().html(message);
            },
            success: function(data) {
                window.location = "/offers/create-buy/"+data._id;
            }
        });
    });

    $('#EditSellOrder button[type="submit"]').on('click',function(){
        $('#EditSellOrder p.error').hide();
        var price = parseFloat(replaceAll($('#EditSellOrder input[name="price"]').val(),",",""));
        var MarketName = $('#EditSellOrder input[name="MarketName"]').val();
        var min_amount = $('#EditSellOrder input[name="min_amount"]').val();
        var max_amount = $('#EditSellOrder input[name="max_amount"]').val();
        var id_order = $('#EditSellOrder input[name="id_order"]').val();
        $.ajax({
            url: "/offers/edit/sell",
            data: {
                price : price,
                MarketName : MarketName,
                min_amount : min_amount,
                max_amount : max_amount,
                token_crt : $('#EditSellOrder input[name="token_crt"]').val(),
                id_order : id_order
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                
                $('#EditSellOrder button[type="submit"]').button('Đang xử lý...');
            },
            error: function(data) {
                load_token();
                $('#EditSellOrder button[type="submit"]').button('reset');
                var message = data.responseJSON.message;
                $('#EditSellOrder p.error').show().html(message);
            },
            success: function(data) {
                window.location = "/offers/create-sell/"+data._id;
            }
        });
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