'use strict';
 $('#preloader').css('display', 'none');
$(document).ready(function($) {

        setTimeout(function() {
            $('#Forgot-Password-page, #Login-page, #Register-page').css({'background-image' : 'url(/img/bg7.jpg)'});
        }, 1000);
            

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    var sponsor = getCookie("ref");
    if (sponsor == undefined) {
        $('#Sponsor').val('');
    } else {
        $('#Sponsor').val(sponsor);
    }
    $('#displayName').on("change paste keyup", function() {
        var name = $('#displayName').val().replace(/[^A-Z0-9]/gi, '');
        $('#displayName').val(name)
    });
    $('#Sponsor').on("change paste keyup", function() {
        var name = $('#Sponsor').val().replace(/[^A-Z0-9]/gi, '');
        $('#Sponsor').val(name)
    });
    $('#preloader').css('display', 'none');
    $.material.init();
    $("#sticky-nav").sticky({
        topSpacing: 0
    });
    $(function() {
        $('a[href*="#"]:not([data-toggle="tab"])').on('click', function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
            }
        });
    });


    $('#frmResendmail').on('submit',function(){
        $.ajax({
            url: "/ResendMail",
            type: "POST",
            data: {
                token: $("input#token").val()
            },
            cache: false,
            beforeSend: function() {
                $('button').attr('disabled', 'disabled').text('Sending...');
            },
            success: function(data) {
                $('button').attr('disabled', 'disabled').text('Activation Email was Resent');
            },
            error: function(data) {
                location.reload(true);
            },
        });
        return false;
    });

    $("#frmLogin input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var email = $("input#email").val(),
                password = $("input#password").val(),
                f2a = $("input#2fa").val();
            var ggcaptcha = $("#g-recaptcha-response").val();
            
            $.ajax({
                url: "/SignIn",
                type: "POST",
                data: {
                    email: email,
                    password: password,
                    f2a : f2a,
                    'ggcaptcha': ggcaptcha
                },
                cache: false,
                beforeSend: function() {
                    grecaptcha.reset();
                    $("input#email + span").hide();
                    $("input#password + span").hide();
                    $('button').attr('disabled', 'disabled').text('Waiting ...');
                },
                success: function(data) {
                    
                    $('#preloader').show();
                    $("#frmLogin input + span").text('');
                    //$('#frmLogin').trigger("reset");
                    setTimeout(function() {
                        location.reload(true);
                    }, 500);
                },
                error: function(data) {
                    var json = data.responseJSON;
                    $('button').removeAttr('disabled').text('Submit');
                    $("#frmLogin input + span").text('');
                    json.error === 'user' && ($("input#email + span").show().text('User or email does not match'), $("input#password + span").show().text('Password does not match'));
                    json.error === 'authen' && $("input#2fa + span").show().text('Incorrect 2FA code');
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmLogin input + span").text('');
    });
    $("#frmRegister input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var ggcaptcha = $("#g-recaptcha-response").val();
            var username = $("input#displayName").val(),
                email = $("input#email").val(),
                password = $("input#password").val(),
                cfpassword = $("input#cfpassword").val(),
                sponsor = getCookie("ref");
            // var Sponsor = $("input#Sponsor").val();
            $.ajax({
                url: "/signUp",
                type: "POST",
                data: {
                    'username': username,
                    'email': email,
                    'password': password,
                    'cfpassword': cfpassword,
                    'Sponsor': $("input#Sponsor").val(),
                    'ggcaptcha': ggcaptcha
                },
                cache: false,
                beforeSend: function() {
                    grecaptcha.reset();
                    
                    $("#frmRegister input + span").text('');
                    $('#frmRegister button.btn-primary').attr('disabled', 'disabled').text('Waiting ...');
                },
                success: function(data) {
                    window.location = "/SignIn";
                    /*var html = '<div class="alert_register">';
                    html += '<h2 class="text-center">Your account has been registered success</h2>';
                    html += '<p>Please check your inbox for account validation</p>';
                    html += '<p><a href="/login">Login Now</a></p>';
                    html += '</div>';
                    $("#frmRegister").html(html);*/
                    
                },
                error: function(data) {
                    
                    $('button.btn-primary').removeAttr('disabled').text('Submit'), data.status === 403 && (_.each(data.responseJSON.message, function(value, i) {
                        value.param === 'email' && $("#email + span").text(value.msg), value.param === 'password' && ($('#password + span').text(value.msg), $('#cfpassword + span').text(value.msg))
                    })), data.status === 401 && (_.each(data.responseJSON.message, function(value, i) {
                        value.param === 'email' && $("#email + span").text(value.msg), value.param === "displayName" && $("#displayName + span").text(value.msg), value.param === 'password' && ($('#password_register + span').text(value.msg), $('#cfpassword + span').text(value.msg))
                    }));
                    //data.status === 402 && ($("#errcapcha").show().html('Please select captcha first'),  setTimeout(function() { location.reload(true); }, 1000))
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });
    $("#frmAuthy input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var authenticator = $("input#authenticator").val();
            $.ajax({
                url: "/Authy",
                type: "POST",
                data: {
                    authenticator: authenticator
                },
                cache: false,
                success: function(data) {
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("");
                    $('#success > .alert-success').append("<strong>Login Success. </strong>");
                    $('#success > .alert-success').append('</div>');
                    localStorage.setItem('token', data.token);
                    $('#frmLogin').trigger("reset");
                    setTimeout(function() {
                        location.reload();
                    }, 800);
                },
                error: function(data) {
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("");
                    $('#success > .alert-danger').append("<strong>" + data.responseJSON.message + "</strong>");
                    $('#success > .alert-danger').append('</div>');
                    $('#frmLogin').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });




    $("#frmForgot input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var ggcaptcha = $("#g-recaptcha-response").val();
            
            var email = $("input#email").val();
            $.ajax({
                url: "/ForgotPassword",
                type: "POST",
                data: {
                    email: email,
                    'ggcaptcha': ggcaptcha
                },
                cache: false,
                beforeSend: function() {
                    grecaptcha.reset();
                    $('button').attr('disabled', 'disabled').text('Waiting ...');
                },
                success: function(data) {
                    // $('#preloader').show();
                    $("#frmForgot input + span").text('');
                    $('#frmForgot').trigger("reset");
                    $('#success').show();
                    var html = '<div class="alert_register">';
                    html += '<h2 class="text-center">Forgot your password is confirmed</h2>';
                    html += '<p>Please check your inbox mail</p>';
                    html += '<p><a href="/SignIn">Login Now</a></p>';
                    html += '</div>';
                    $("#frmForgot").html(html);
                   
                },
                error: function(data) {
                    $('.fa-refresh').trigger('click');
                    var json = data.responseJSON;
                    $('button').removeAttr('disabled').text('Submit');
                    $("#frmForgot input + span").text('');
                    json.error === 'user' && ($("input#email + span").text('Email does not exist'));
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmForgot input + span").text('');
    });
    $("#contactForm input, #contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var name = $("input#name").val();
            var email = $("input#email").val();
            var message = $("textarea#message").val();
            var firstName = name;
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: "././mail/sendmail.php",
                type: "POST",
                data: {
                    name: name,
                    email: email,
                    message: message
                },
                cache: false,
                success: function() {
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append("</button>");
                    $('#success > .alert-success').append("<strong>Your message has been sent. </strong>");
                    $('#success > .alert-success').append('</div>');
                    $('#contactForm').trigger("reset");
                },
                error: function() {
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!");
                    $('#success > .alert-danger').append('</div>');
                    $('#contactForm').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });



    $("#frmChangePassword input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var password = $("input#password").val(),
                cfpassword = $("input#cfpassword").val(),
                ggcaptcha = $("#g-recaptcha-response").val(),
                token = $("input#token").val();
                
            $.ajax({
                url: "/change-password-submit",
                type: "POST",
                data: {
                    password: password,
                    cfpassword: cfpassword,
                    'ggcaptcha': ggcaptcha,
                    'token' :token
                },
                cache: false,
                beforeSend: function() {

                    grecaptcha.reset();
                    if (password != cfpassword)
                    {
                        $("input#cfpassword + span").show().text('Passwords do not match');
                        return false;
                    }
                    $("input#password + span").hide();
                    $("input#cfpassword + span").hide();

                    $('button').attr('disabled', 'disabled').text('Waiting ...');

                },
                success: function(data) {
                    
                    $("#frmChangePassword input + span").text('');
                    //$('#frmLogin').trigger("reset");
                    window.location = "/SignIn";
                },
                error: function(data) {
                    location.reload(true);
                    //window.location = "/login";
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmChangePassword input + span").text('');
    });
});

function enableBtn(){
    document.getElementById("submit_button").disabled = false;
}