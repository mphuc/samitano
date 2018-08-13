$(function(){

    $('#frmNewSupport').on('submit', function(){
        $('#subject').css({'border':'1px solid #ccc'});
        $('#message').css({'border':'1px solid #ccc'});
        if ($('#subject').val() == ''){
            $('#subject').css({'border':'1px solid rgb(255, 50, 50)'});
            $('#subject').focus();
            return false;
        }
        if ($('#message').val() == ''){
            $('#message').css({'border':'1px solid rgb(255, 50, 50)'});
            $('#message').focus();
            return false;
        }
        if (grecaptcha.getResponse() == 0){
            return false;
        }

        $(this).ajaxSubmit({
            beforeSend: function() {
                $('#frmNewSupport button[type="submit"]').button('loading');
            },
            error: function(result) 
            {
                grecaptcha.reset();
                var message = result.responseJSON.message;
                swal({
                    title: "",
                    type: "error",
                    text:message,
                    showConfirmButton: true
                })
                $('#frmNewSupport button[type="submit"]').button('reset');
            },
            success: function(result) 
            {
                grecaptcha.reset();
                swal({
                    type: "success",
                    title: "Send Success",
                    text:'Send feedback successfully',
                    showConfirmButton: true
                },
                function(isConfirm) {
                      if (isConfirm) {
                        window.location.href = "/support";
                      }
                  })
                setTimeout(function() {
                    window.location.href = "/support";
                }, 9000);
            }
        });
        return false;
    });

    $('#frmReplySupport').on('submit', function(){
        $('#message').css({'border':'1px solid #ccc'});
        if ($('#message').val() == ''){
            $('#message').css({'border':'1px solid rgb(255, 50, 50)'});
            $('#message').focus();
            return false;
        }
        $(this).ajaxSubmit({
            beforeSend: function() {
                $('#frmReplySupport button[type="submit"]').button('loading');
            },
            error: function(result) 
            {
                grecaptcha.reset();
                var message = result.responseJSON.message;
                swal({
                    title: "",
                    type: "error",
                    text:message,
                    showConfirmButton: true
                })
                $('#frmReplySupport button[type="submit"]').button('reset');
            },
            success: function(result) 
            {
                location.reload(true);
            }
        });
        return false;
    });

})
