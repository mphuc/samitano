$(function(){

    $('#OffersBuy input[name="amount"]').on('input propertychange',function(){
        var price = $('#OffersBuy input[name="price"]').val().replace(',','');
        var amount = parseFloat($(this).val()) * parseFloat(price);
        $('#OffersBuy #fiat_amount').html(format_number(amount)+' VND');
    });
    $('#OffersSell input[name="amount"]').on('input propertychange',function(){
        var price = $('#OffersSell input[name="price"]').val().replace(',','');
        var amount = parseFloat($(this).val()) * parseFloat(price);
        $('#OffersSell #fiat_amount').html(format_number(amount)+' VND');
    });
    $('#OffersBuy button[type="submit"]').on('click',function(){
        $('#OffersBuy p.error').hide();
        var _id = $('#OffersBuy input[name="_id"]').val();
        var token_crt = $('#OffersBuy input[name="token_crt"]').val();
        var amount = $('#OffersBuy input[name="amount"]').val();

        $.ajax({
            url: "/offers/submitbuy",
            data: {
                _id : _id,
                amount : amount,
                token_crt : token_crt
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                
                $('#OffersBuy button[type="submit"]').button('Đang xử lý...');
            },
            error: function(data) {
                load_token();
               
                $('#OffersBuy button[type="submit"]').button('reset');
                var message = data.responseJSON.message;
                $('#OffersBuy p.error').show().html(message);
            },
            success: function(data) {
                window.location = "/trades-buy/"+data._id;
            }
        });
        return false;
    });


    $('#OffersSell button[type="submit"]').on('click',function(){
        $('#OffersSell p.error').hide();
        var _id = $('#OffersSell input[name="_id"]').val();
        var token_crt = $('#OffersSell input[name="token_crt"]').val();
        var amount = $('#OffersSell input[name="amount"]').val();

        $.ajax({
            url: "/offers/submitsell",
            data: {
                _id : _id,
                amount : amount,
                token_crt : token_crt
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                
                $('#OffersSell button[type="submit"]').button('Đang xử lý...');
            },
            error: function(data) {
                load_token();
               
                $('#OffersSell button[type="submit"]').button('reset');
                var message = data.responseJSON.message;
                $('#OffersSell p.error').show().html(message);
            },
            success: function(data) {
                window.location = "/trades-sell/"+data._id;
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