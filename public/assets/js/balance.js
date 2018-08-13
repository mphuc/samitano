$(function(){
    $('#frmWihtdrawBTC').on('submit', function(){
        $(this).ajaxSubmit({
            beforeSend: function() {
                
            },
            error: function(result) 
            {
                
            },
            success: function(result) 
            {
                
            }
        });
        return false;
    });
    
})