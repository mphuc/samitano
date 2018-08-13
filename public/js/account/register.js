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

    var ajaxRegister = function(user , email, password, cfpassword ,ggcaptcha){
        $.ajax({
                url: "/signUp",
                type: "POST",
                data: {
                    user : user,
                    email: email,
                    password: password,
                    cfpassword: cfpassword,
                    Sponsor: typeof sponsor === 'undefined' ? '' : sponsor,
                    ggcaptcha : ggcaptcha
                },
                cache: false,
                beforeSend: function() {
                   fomatLogin();
                   $('#Register-page #frmRegister > img').show();
                },
                success: function(data) {
                        location.href = '/register-success';
                        // $('#Register-page div.card-contact').html(
                        //     "<p>Registration successful</p>"+
                        //     "<p>Please check mail <span style='color: red'>"+email+"</span> to active</p>"+
                        //     "<p><a class='red' href='/free-registration.html'>Reload Page</a>"
                        // ).css({
                        //         'text-align': 'center',
                        //         'padding': '40px',
                        //         'border' :'none'
                        // });
                },
                error: function(data) {
                    grecaptcha.reset();
                    $('#Register-page #frmRegister > img').hide();

                    data.status === 403 && (
                        _.each(data.responseJSON.message, function(value, i) {
                            value.param === 'displayName' && ($("#user + span").show().text(value.msg), $(".user").addClass('has-error')),
                            value.param === 'email' && ($("#email + span").show().text(value.msg), $(".email").addClass('has-error')),
                            value.param === 'password' && (($('#password + span').show().text(value.msg), $(".password").addClass('has-error'),
                            $('#re-password + span').show().text(value.msg)), $(".re-password").addClass('has-error'))
                    })), data.status === 401 && (
                        _.each(data.responseJSON.message, function(value, i) {
                            value.param === 'displayName' && ($("#user + span").show().text(value.msg), $(".user").addClass('has-error')),
                            value.param === 'email' && ($("#email + span").show().text(value.msg), $(".email").addClass('has-error')),
                            value.param === 'password' && (($('#password + span').show().text(value.msg), $(".password").addClass('has-error'),
                            $('#re-password + span').show().text(value.msg) ,  $(".re-password").addClass('has-error')))
                    }));
                },
            });
    }

    $('#frmRegister').on('submit', function(env){
        fomatLogin();
        var email = $('#email').val(),
            passowd = $('#password').val(),
            cfpassword = $('#re-password').val(),
            user = $('#user').val();
        ajaxRegister(user , email, passowd,cfpassword , dataCapcha);
        return false;
    });

    grecaptcha.render("recaptcha", {
        sitekey: '6LfTIDYUAAAAAIscAJ-qcY2EkCCZLfGK3O6FPnSj',
        callback: function (data) {
            dataCapcha = data;
        }
    });
};
