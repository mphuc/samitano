'use strict';
 $('#preloader').css('display', 'none');
$(document).ready(function($) {

        

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
    
    
    $("#frmLogin input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var email = $("input[name='email']").val(),
                password = $("input[name='password']").val(),
                token = $("input[name='token']").val();
            $.ajax({
                url: "/SignIn",
                type: "POST",
                data: {
                    email: email,
                    password: password,
                    token : token
                    
                },
                cache: false,
                beforeSend: function() {
                    if ($("input[name='email']").val() == '' )
                    {
                        $("input[name='email'] + span").show().text('Email là bắt buộc');
                        return false;
                    }
                    if ($("input[name='password']").val() == '')
                    {
                        $("input[name='password'] + span").show().text('Mật khẩu là bắt buộc');
                        return false;
                    }
                    $("input[name='email'] + span").hide();
                    $("input[name='password'] + span").hide();
                    $('button').attr('disabled', 'disabled').text('Chờ xử lý ...');
                },
                success: function(data) {
                    setTimeout(function() {
                        location.reload(true);
                    }, 500);
                },
                error: function(data) {
                    load_token();
                    var json = data.responseJSON;     
                    $('button').removeAttr('disabled').text('Đăng nhập');
                    $("#frmLogin input + span").text('');
                    json.error === 'user' && ($("input[name='email'] + span").show().text('Email hoặc mật khẩu không đúng'), 
                        $("input[name='password'] + span").show().text('Email hoặc mật khẩu không đúng'));
                    
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmLogin input + span").text('');
    });

    if (window.location.hash == '#register')
    {   
        if (localStorage.getItem('email_register'))
        {
            $('.alert_register strong.email').html(localStorage.getItem('email_register'));
            $('.alert_register').show();
        }
        
    }
    if (window.location.hash == '#changepassword')
    {     
        $('.alert_changepassword').show();
    }

    

    if (getCookie('sponsor'))
    {
        $('#frmregister .sponsor').val(getCookie('sponsor'));
    }
    

    $("#frmregister input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            
            event.preventDefault();
            var username = $("input[name='username']").val(),
                email = $("input[name='email']").val(),
                password = $("input[name='password']").val(),
                cfpassword = $("input[name='cfpassword']").val(),
                token = $("input[name='token']").val(),
                sponsor = $("input[name='sponsor']").val();
            $.ajax({
                url: "/signUp",
                type: "POST",
                data: {
                    email: email,
                    password: password,
                    username : username,
                    cfpassword : cfpassword,
                    token : token,
                    sponsor : sponsor
                    
                },
                cache: false,
                beforeSend: function() {
                    if ($("input[name='username']").val() == '' )
                    {
                        $("input[name='username'] + span").show().text('Tên đăng nhập là bắt buộc');
                        return false;
                    }

                    if ($("input[name='email']").val() == '' || !validateEmail($("input[name='email']").val()))
                    {
                        $("input[name='email'] + span").show().text('Vui lòng nhập địa chỉ email');
                        return false;
                    }
                    if ($("input[name='password']").val() == '')
                    {
                        $("input[name='password'] + span").show().text('Mật khẩu là bắt buộc');
                        return false;
                    }

                    var regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
                    if( !regex.test($("input[name='password']").val())) {
                        $("input[name='password'] + span").show().text('Mật khẩu gồm 8 ký tự, gồm chữ thường, chữ hoa và ký tự số');
                        return false;
                    }

                    if ($("input[name='cfpassword']").val() == '' || $("input[name='password']").val() != $("input[name='cfpassword']").val())
                    {
                        $("input[name='cfpassword'] + span").show().text('Mật khẩu không trùng khớp');
                        return false;
                    }
                    $("input[name='username'] + span").hide();
                    $("input[name='email'] + span").hide();
                    $("input[name='password'] + span").hide();
                    $("input[name='cfpassword'] + span").hide();
                    $('button').attr('disabled', 'disabled').text('Chờ xử lý ...');
                },
                success: function(data) {
                    window.location = "/signIn#register";
                    localStorage.setItem('email_register', email);
                },
                error: function(data) {
                    data == 'Forbidden' && location.reload(true);
                    load_token();
                    var json = data.responseJSON;     
                    $('button').removeAttr('disabled').text('Đăng ký tài khoản');
                    $("#frmregister input + span").text('');

                    _.forEach(json.message, function(value) {
                        (value.param == 'email') && $("input[name='email'] + span").show().text('Email đã tồn tại'),
                        (value.param == 'displayName') && $("input[name='username'] + span").show().text('Tên đăng nhập đã tồn tại')
                    })
                }
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmregister input + span").text('');
    });


    $("#frmForgot input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            event.preventDefault();
            var email = $("input[name='email']").val(),
                token = $("input[name='token']").val();
            $.ajax({
                url: "/ForgotPassword",
                type: "POST",
                data: {
                    email: email,
                    token : token
                    
                },
                cache: false,
                beforeSend: function() {
                    if ($("input[name='email']").val() == '' )
                    {
                        $("input[name='email'] + span").show().text('Email là bắt buộc');
                        return false;
                    }
                    $("input[name='email'] + span").hide();
                    $('button').attr('disabled', 'disabled').text('Đang chờ xử lý ...');
                },
                success: function(data) {
                    $('.alert_forgot').show();
                    $("#frmForgot input + span").text('');
                    $("input[name='email']").val('');
                    $("input[name='token']").val('');
                    $('#frmForgot').css({'opacity' : 0});
                },
                error: function(data) {
                    load_token();
                    var json = data.responseJSON;     
                    $('button').removeAttr('disabled').text('Lấy lại mật khẩu');
                    $("#frmForgot input + span").text('');
                    json.error === 'user' && $("input[name='email'] + span").show().text('Email không tồn tại');
                    
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmForgot input + span").text('');
    });



    $("#frmChangePasswordss input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {},
        submitSuccess: function($form, event) {
            
            event.preventDefault();
            var password = $("input[name='password']").val(),
                cfpassword = $("input[name='cfpassword']").val(),
                token = $("input[name='token']").val();
            $.ajax({
                url: "/change-password-submit",
                type: "POST",
                data: {
                    password: password,
                    cfpassword : cfpassword,
                    token : token
                    
                },
                cache: false,
                beforeSend: function() {
                    
                    if ($("input[name='password']").val() == '')
                    {
                        $("input[name='password'] + span").show().text('Mật khẩu là bắt buộc');
                        return false;
                    }

                    var regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
                    if( !regex.test($("input[name='password']").val())) {
                        $("input[name='password'] + span").show().text('Mật khẩu gồm 8 ký tự, gồm chữ thường, chữ hoa và ký tự số');
                        return false;
                    }

                    if ($("input[name='cfpassword']").val() == '' || $("input[name='password']").val() != $("input[name='cfpassword']").val())
                    {
                        $("input[name='cfpassword'] + span").show().text('Mật khẩu không trùng khớp');
                        return false;
                    }
                    $("input[name='password'] + span").hide();
                    $("input[name='cfpassword'] + span").hide();
                    $('button').attr('disabled', 'disabled').text('Chờ xử lý ...');
                },
                success: function(data) {
                    window.location = "/signIn#changepassword";
                },
                error: function(data) {
                    location.reload(true);
                }
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    }).on('change', function() {
        $("#frmChangePasswordss input + span").text('');
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
                $('button').attr('disabled', 'disabled').text('Đang gửi...');
            },
            success: function(data) {
                $('button').attr('disabled', 'disabled').text('Email kích hoạt đã được gửi lại');
            },
            error: function(data) {
                location.reload(true);
            },
        });
        return false;
    });

});


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}