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

    var ajaxLogin = function(email, password, ggcaptcha){
        $.ajax({
                url: "/SignIn",
                type: "POST",
                data: {
                    email: _.trim(email),
                    password: _.trim(password),
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
                    location.reload(true)
                },
                error: function(data) {
                    grecaptcha.reset();
                    dataCapcha = null;
                    $('.login-page-right > img').hide();
                    data.status === 401 && data.responseJSON.error === 'user' && ($('.error-box').show(), $('.form-group').addClass('has-error') , $('#email').focus(), grecaptcha.reset());
                },
            })
    }

    $('#frmLogin').on('submit', function(env){
        fomatLogin();
        var email = $('#email').val(),
            passowd = $('#password').val();
        _.trim(email) === '' || _.trim(passowd) === '' ? (
            $('.error-box').show(), $('.form-group').addClass('has-error') , $('#email').focus(), grecaptcha.reset(), dataCapcha = null
        ) : (
            ajaxLogin(email, passowd, dataCapcha)
        )
        return false;
    });
    $('#frmAuthySm').click(function(env){
        var authenticator = $("input#authenticator").val();
            $.ajax({
                url: "/Authy",
                type: "POST",
                data: {
                    authenticator: authenticator
                },
                cache: false,
                beforeSend: function() {
                  
                    $('.login-page-right > img').show();
                    
                },
                success: function(data) {
                 
                    localStorage.setItem('token', data.token);
                    $('#frmLogin').trigger("reset");
                    setTimeout(function() {
                        location.reload();
                    }, 800);
                },
                error: function(data) {
                    $('.login-page-right > img').hide();
                    $('.errAuthy').show().html(data.responseJSON.message);
                   
                    $('#frmAuthy').trigger("reset");
                },
            })
    });


    grecaptcha.render("recaptcha", {
        sitekey: '6LfTIDYUAAAAAIscAJ-qcY2EkCCZLfGK3O6FPnSj',
        callback: function (data) {
            dataCapcha = data;
        }
    });
};
