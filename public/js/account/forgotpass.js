var dataCapcha = null;
var recaptchaCallback = function () {
    $('.login-page-right > img').css({
        'width' : $('#Login-page .login-page-right').width(),
        'height' : $('#Login-page .bg-whilet').height()
    })

    $('#Register-page #frmRegister > img').css({
        'width' : $('#frmRegister').width(),
        'height' : $('#frmRegistert').height()
    })

    setTimeout(function() {
        $('#Register-page #frmRegister > img').hide();  
        $('.login-page-right > img').hide();
    }, 500);

    var fomatLogin = function(){
        $('.error-box').hide();
        $('.form-group').removeClass('has-error');
    };

    var ajaxForgot = function(email, ggcaptcha){
        $.ajax({
                url: "/ForgotPassword",
                type: "POST",
                data: {
                    email: _.trim(email),
                    ggcaptcha: ggcaptcha
                },
                cache: false,
                beforeSend: function() {
                    fomatLogin();
                    $('.login-page-right > img').show();
                    ggcaptcha === null && $('.login-page-right > img').hide();
                    return ggcaptcha !== null 
                },
                success: function(data) {

                    $('#success').show();
                    grecaptcha.reset();
                    $('#email').val('');
                    $('.login-page-right > img').hide();
                    
                },
                error: function(data) {
                    grecaptcha.reset();
                    dataCapcha = null;
                    $('.login-page-right > img').hide();
                    data.status === 401 && data.responseJSON.error && ($('#errcapcha').html(data.responseJSON.error).show(), $('.form-group').addClass('has-error') , $('#email').focus(), grecaptcha.reset());
                },
            })
    }

    $('#frmForgot').on('submit', function(env){
        fomatLogin();
        var email = $('#email').val();
            
        _.trim(email) === '' ? (
            $('.error-box').show(), $('.form-group').addClass('has-error') , $('#email').focus(), grecaptcha.reset(), dataCapcha = null
        ) : (
            ajaxForgot(email, dataCapcha)
        )
        return false;
    });

    grecaptcha.render("recaptcha", {
        sitekey: '6LfTIDYUAAAAAIscAJ-qcY2EkCCZLfGK3O6FPnSj',
        callback: function (data) {
            dataCapcha = data;
        }
    });
};
