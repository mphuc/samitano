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
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append("</button>");
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
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append("</button>");
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