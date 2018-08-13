function GetFormattedDate(todayTime) {
    var todayTime = new Date(todayTime);
    var month = (todayTime .getMonth() + 1);
    var day = (todayTime .getDate());
    var year = (todayTime .getFullYear());
    
    return month + "/" + day + "/" + year;
}
$(function(){

    if (location.pathname == "/") {
        load_price();
    }
    

    if (location.pathname == "/balance/vnd") {
        load_deposit_finish_vnd();
    }
    if (location.pathname == "/balance/stc") {
        load_deposit_finishs_stc()
    }

    
    $('#Deposit-Vnd input[name="number_vnd"]').on('input propertychange',function(){
        var number = $(this).val();
        var number_replace = replaceAll(number,",","");
        
        $(this).val(format_number(number_replace));
    })
    

    $('#Deposit-Vnd button[type="submit"]').on('click',function(){
        $('#Deposit-Vnd p.error').hide();
        var amount = parseFloat(replaceAll($('#Deposit-Vnd input[name="number_vnd"]').val(),",",""));
        $.ajax({
            url: "/account/balance/deposit-vnd",
            data: {
                type : 'VND',
                'amount' : amount,
                'token_crt' : $('#Deposit-Vnd input[name="token_crt"]').val()
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                if (!amount || isNaN(amount) || amount < 100000)
                {
                    $('#Deposit-Vnd  p.error').show().html('Vui lòng nhập số tiền lớn hơn 100,000 VND!');
                    return false;
                }
                $('#Deposit-Vnd button[type="submit"]').button('loading');
            },
            error: function(data) {
                load_token();
                $('#Deposit-Vnd button[type="submit"]').button('reset');
                location.reload(true);
            },
            success: function(data) {
                location.reload(true);
            }
        });
        return false;
    });


    $('#Widthdraw-Vnd input[name="amount"]').on('input propertychange',function(){
        var number = $(this).val();
        var number_replace = replaceAll(number,",","");
        
        $(this).val(format_number(number_replace));
    })

    $('#Widthdraw-Vnd  input[name="account_number"]').on('input propertychange',function(){
        if ($(this).val().length >= 13)
        {
            $('.icon_loading_bank').show();
            $('#Widthdraw-Vnd p.error').hide();
            $.ajax({
                url: "/get-account-bank/"+$(this).val(),
                data: {
                   
                },
                type: "GET",
                beforeSend: function() {
                    
                },
                error: function(data) {
                    
                },
                success: function(data) {
                    if (data.status == 'finish') 
                    {
                        $('#Widthdraw-Vnd  input[name="account_horder"]').val(data.amount_horder);
                    }
                    else
                    {
                        $('#Widthdraw-Vnd p.error').show().html('Tài khoản này không thể nhận thanh toán');
                    }
                    $('.icon_loading_bank').hide();
                }
            });
        }
        return false;
    })



    $('#Widthdraw-Vnd  button[type="submit"]').on('click',function(){
        
        $('.form_withdraw_vnd').hide();
        $('.confirm_withdraw_vnd').show();

        $('#amout_withdraw_vnd').html($('#Widthdraw-Vnd input[name="amount"]').val()+' VND');
        $('#bankname_withdraw_vnd').html($('#Widthdraw-Vnd select[name="bank_name"]').val());
        $('#accouthorder_withdraw_vnd').html($('#Widthdraw-Vnd input[name="account_horder"]').val());
        $('#accoutnumber_withdraw_vnd').html($('#Widthdraw-Vnd input[name="account_number"]').val());

        $('.confirm_withdraw_vnd_submit').on('click',function(){

            $('#Widthdraw-Vnd  p.error').hide();
            var amount = parseFloat(replaceAll($('#Widthdraw-Vnd input[name="amount"]').val(),",",""));
            $.ajax({
                url: "/account/balance/withdraw-vnd",
                data: {
                    'type' : 'VND',
                    'amount' : amount,
                    'account_horder' : $('#Widthdraw-Vnd input[name="account_horder"]').val(),
                    'account_number' : $('#Widthdraw-Vnd input[name="account_number"]').val(),
                    'bank_name' : $('#Widthdraw-Vnd select[name="bank_name"]').val(),
                    'authenticator' : $('#Widthdraw-Vnd input[name="authenticator"]').val(),
                    'token_crt' : $('#Widthdraw-Vnd input[name="token_crt"]').val()
                },
                type: "POST",
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('.confirm_withdraw_vnd_submit').button('loading');
                },
                error: function(data) {
                    load_token();
                    $('.form_withdraw_vnd').show();
                    $('.confirm_withdraw_vnd').hide();
                    var message = data.responseJSON.message;
                    $('#Widthdraw-Vnd p.error').show().html(message);
                    $('.confirm_withdraw_vnd_submit').button('reset');
                },
                success: function(data) {
                   location.reload(true);
                }
            });
            return false;
        })
        return false;
    })

    $('.back_withdraw_vnd_submit').on('click',function(){
        load_token();
        $('.form_withdraw_vnd').show();
        $('.confirm_withdraw_vnd').hide();
    })
    

    $('#Widthdraw-STC  button[type="submit"]').on('click',function(){
        $('#Widthdraw-STC  p.error').hide();
        $.ajax({
            url: "/account/balance/withdraw",
            data: {
                'type' : 'STC',
                'amount' : $('#Widthdraw-STC input[name="amount"]').val(),
                'wallet' : $('#Widthdraw-STC input[name="wallet"]').val(),
                'token_crt' : $('#Widthdraw-STC input[name="token_crt"]').val()
            },
            type: "POST",
            beforeSend: function() {
                $('.token_crt').val('');
                $('#Widthdraw-STC button[type="submit"]').button('loading');
            },
            error: function(data) {
                load_token();
                var message = data.responseJSON.message;
                $('#Widthdraw-STC p.error').show().html(message);
                $('#Widthdraw-STC button[type="submit"]').button('reset');
            },
            success: function(data) {
               location.reload(true);
            }
        });
    })


    $('#tab-vnd a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var id = $(e.target).attr("href");
         
        if (id == '#withdrawVND')
        {
            load_withdraw_finish_vnd();
        }

        if (id == '#withdrawSTC')
        {
            load_withdraw_pendding_stc();
        }
       

        if (id == '#historyVND')
        {
            load_withdraw_history_vnd();
            load_deposit_history_vnd();
        }
        if (id == '#historySTC')
        {
            load_withdraw_finish_stc();
            load_deposit_finish_stc();
        }
    });
    

    $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var id = $(e.target).attr("href");
        localStorage.setItem('selectedTab', id)
    });

    var selectedTab = localStorage.getItem('selectedTab');
    if (selectedTab != null) {
        $('a[data-toggle="tab"][href="' + selectedTab + '"]').tab('show');
    }


    $('button[data-target="#modalDepositCOIN"]').on('click',function(){
        $.ajax({
            url: "/account/balance/wallet",
            data: {
                type : 'STC'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositCOIN .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" style="margin: 0; position: absolute; top: 88%; left: 50%; transform: translate(-50%, -50%); z-index: 999; width: 60px;">');
            },
            error: function(data) {
                $('button[data-target="#modalDepositCOIN"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositCOIN').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('button[data-target="#modalDepositCOIN"]').button('reset');
                    $('#modalDepositCOIN .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositCOIN .modal-body .wallets').html(html);
                    $('#modalDepositCOIN #inputaddress').val(data.wallet);
                    $('#modalDepositCOIN #address-qr').html('<img src="https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl=' + data.wallet + '" alt="">');
                }, 1000);
            }
        });
    });


    
    $('button[data-target="#modalDepositDASH"]').on('click',function(){
        $.ajax({
            url: "/account/balance/wallet",
            data: {
                type : 'DASH'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositDASH .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" style="margin: 0; position: absolute; top: 88%; left: 50%; transform: translate(-50%, -50%); z-index: 999; width: 60px;">');
            },
            error: function(data) {
                $('button[data-target="#modalDepositDASH"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositDASH').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('button[data-target="#modalDepositDASH"]').button('reset');
                    $('#modalDepositDASH .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositDASH .modal-body .wallets').html(html);
                    $('#modalDepositDASH #inputaddress').val(data.wallet);
                    $('#modalDepositDASH #address-qr').html('<img src="https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl=' + data.wallet + '" alt="">');
                }, 1000);
            }
        });
    });

    $('button[data-target="#modalDepositLTC"]').on('click',function(){
        $.ajax({
            url: "/account/balance/wallet",
            data: {
                type : 'LTC'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositLTC .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" style="margin: 0; position: absolute; top: 88%; left: 50%; transform: translate(-50%, -50%); z-index: 999; width: 60px;">');
            },
            error: function(data) {
                $('button[data-target="#modalDepositLTC"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositLTC').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('button[data-target="#modalDepositLTC"]').button('reset');
                    $('#modalDepositLTC .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositLTC .modal-body .wallets').html(html);
                    $('#modalDepositLTC #inputaddress').val(data.wallet);
                    $('#modalDepositLTC #address-qr').html('<img src="https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl=' + data.wallet + '" alt="">');
                }, 1000);
            }
        });
    });

    $('button[data-target="#modalDepositBTC"]').on('click',function(){
        $.ajax({
            url: "/account/balance/wallet",
            data: {
                type : 'VND'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositBTC .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" style="margin: 0; position: absolute; top: 88%; left: 50%; transform: translate(-50%, -50%); z-index: 999; width: 60px;">');
            },
            error: function(data) {
                $('button[data-target="#modalDepositBTC"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositBTC').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('button[data-target="#modalDepositBTC"]').button('reset');
                    $('#modalDepositBTC .modal-body .wallets').html(data.wallet);
                    
                }, 1000);
            }
        });
    });

    $('button[data-target="#modalDepositBTG"]').on('click',function(){
        $.ajax({
            url: "/account/balance/wallet",
            data: {
                type : 'BTG'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositBTG .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" style="margin: 0; position: absolute; top: 88%; left: 50%; transform: translate(-50%, -50%); z-index: 999; width: 60px;">');
            },
            error: function(data) {
                $('button[data-target="#modalDepositBTG"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositBTG').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('button[data-target="#modalDepositBTG"]').button('reset');
                    $('#modalDepositBTG .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositBTG .modal-body .wallets').html(html);
                    $('#modalDepositBTG #inputaddress').val(data.wallet);
                    $('#modalDepositBTG #address-qr').html('<img src="https://chart.googleapis.com/chart?chs=270x270&amp;cht=qr&amp;chl=' + data.wallet + '" alt="">');
                }, 1000);
            }
        });
    })


    $('#frmWihtdrawDASH').on('submit', function(){
        $('#modalWithdrawDASH').modal('toggle');

        $('#Confirm-Submit-DASH input[name="address"]').val($('#frmWihtdrawDASH #address').val());
        $('#Confirm-Submit-DASH input[name="amount"]').val($('#frmWihtdrawDASH #amount_withdraw').val());

        $('#modalWithdrawConfirmDASH').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmDASH .alert').hide();
        $('#Confirm-Submit-DASH').on('submit',function(){
            $('#modalWithdrawConfirmDASH .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-DASH button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmDASH .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-DASH button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal DASH is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawLTC').on('submit', function(){
        $('#modalWithdrawLTC').modal('toggle');

        $('#Confirm-Submit-LTC input[name="address"]').val($('#frmWihtdrawLTC #address').val());
        $('#Confirm-Submit-LTC input[name="amount"]').val($('#frmWihtdrawLTC #amount_withdraw').val());

        $('#modalWithdrawConfirmLTC').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmLTC .alert').hide();
        $('#Confirm-Submit-LTC').on('submit',function(){
            $('#modalWithdrawConfirmLTC .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-LTC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmLTC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-LTC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal LTC is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });


   
    $('#frmWihtdrawBTG').on('submit', function(){
        $('#modalWithdrawBTG').modal('toggle');

        $('#Confirm-Submit-BTG input[name="address"]').val($('#frmWihtdrawBTG #address').val());
        $('#Confirm-Submit-BTG input[name="amount"]').val($('#frmWihtdrawBTG #amount_withdraw').val());

        $('#modalWithdrawConfirmBTG').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmBTG .alert').hide();
        $('#Confirm-Submit-BTG').on('submit',function(){
            $('#modalWithdrawConfirmBTG .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-BTG button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmBTG .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-BTG button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal BTG is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });


    $('#frmWihtdrawBTC').on('submit', function(){
        $('#modalWithdrawBTC').modal('toggle');

        $('#Confirm-Submit-BTC input[name="namebank"]').val($('#frmWihtdrawBTC #namebank').val());
        $('#Confirm-Submit-BTC input[name="numberbank"]').val($('#frmWihtdrawBTC #numberbank').val());
        $('#Confirm-Submit-BTC input[name="horderbank"]').val($('#frmWihtdrawBTC #horderbank').val());
        $('#Confirm-Submit-BTC input[name="branchbank"]').val($('#frmWihtdrawBTC #branchbank').val());

        $('#Confirm-Submit-BTC input[name="amount"]').val($('#frmWihtdrawBTC #amount_withdraw').val());

        $('#modalWithdrawConfirmBTC').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmBTC .alert').hide();
        $('#Confirm-Submit-BTC').on('submit',function(){
            $('#modalWithdrawConfirmBTC .alert').hide();
            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-BTC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmBTC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-BTC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Rút thành công",
                        type: 'success',
                        text:"Vui lòng đợi, Việt Nam đồng rút của bạn đang được xử lý.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 4500);
                }
            });
            return false;
        })
        return false;
    });

    
    
    $('#frmWihtdrawCOIN').on('submit', function(){
        $('#modalWithdrawCOIN').modal('toggle');
        $('#Confirm-Submit-COIN input[name="address"]').val($('#frmWihtdrawCOIN #address').val());
        $('#Confirm-Submit-COIN input[name="amount"]').val($('#frmWihtdrawCOIN #amount_withdraw').val());

        $('#modalWithdrawConfirmCOIN').modal({
            show: 'true'
        }); 
        
        $('#modalWithdrawConfirmCOIN .alert').hide();
        $('#Confirm-Submit-COIN').on('submit',function(){
            
            $('#modalWithdrawConfirmCOIN .alert').hide();
           
            $('#Confirm-Submit-COIN').ajaxSubmit({

                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-COIN button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmCOIN .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-COIN button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    $('#Confirm-Submit-COIN button[type="submit"]').button('reset');
                    swal({
                    title: "Rút thành công",
                        type: 'success',
                        text:"Vui lòng đợi, Santacoin rút của bạn đang được xử lý.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000)
                }
            });
            return false;
        })
        return false;
    });

    $('#modalWithdrawCOIN #amount').on('input propertychange',function(){
        $('#modalWithdrawCOIN #amount_withdraw').val(
            ((($('#modalWithdrawCOIN #amount').val() * 100000000) - (0.003 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawBTC #amount').on('input propertychange',function(){
         $('#modalWithdrawBTC #amount_withdraw').val(
            ((($('#modalWithdrawBTC #amount').val() * 100000000) - (5000 * 100000000)) / 100000000)
        );
    });

    $('#modalWithdrawBTG #amount').on('input propertychange',function(){
        $('#modalWithdrawBTG #amount_withdraw').val(
            ((($('#modalWithdrawBTG #amount').val() * 100000000) - (0.001 * 100000000)) / 100000000).toFixed(8)
        );
    });


    $('.crt_button').on('click',function(){
        load_token();
    });

    if (location.hash){
        $('a[data-toggle="tab"][href="' + location.hash + '"]').tab('show');
    }
})


function showNotification(from, align, msg, type) {
    var color = Math.floor((Math.random() * 6) + 1);
    $.notify({
        icon: "notifications",
        message: msg
    }, {
        type: type,
        timer: 3000,
        placement: {
            from: from,
            align: align
        }
    });
}

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

function load_deposit_pending() {
    $.ajax({
        url: "/account/balance/history-deposit-pending",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestssss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Số lượng </th> <th>Đơn vị</th><th>Xác nhận</th><th>Txid</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#history-deposit-pending').html(html);
            $('#list-yourinvestssss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'confirm'
                }
                , {
                    data: 'txid'
                }]
            });
            
        }
    });
}

function load_deposit_finish_vnd() {
    $.ajax({
        url: "/account/balance/history-deposit-finish-vnd",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestssss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Nội dung chuyển khoản</th> <th>LƯỢNG VND</th><th>TRẠNG THÁI</th></tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#history-deposit-finish-all').html(html);
            $('#list-yourinvestssss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'contentbank'
                }, {
                    data: 'amount'
                },
                 {
                    data: 'status'
                }
                ]
            });
            $('.loading_bar_vnd_deposit').hide();
        }
    });
}

function load_deposit_history_vnd() {
    $.ajax({
        url: "/account/balance/history-deposit-history-vnd",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestsss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Nội dung chuyển khoản</th> <th>LƯỢNG VND</th><th>TRẠNG THÁI</th></tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#history-deposit-finish').html(html);
            $('#list-yourinvestsss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'contentbank'
                }, {
                    data: 'amount'
                },
                 {
                    data: 'status'
                }
                ]
            });
            $('.loading_bar_vnd').hide();
            $('.history_loading_vnd').show();
        }
    });
}

function load_withdraw_history_vnd() {
    $.ajax({
        url: "/account/balance/history-withdraw-history-vnd",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvests" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>MÃ RÚT TIỀN</th> <th>LƯỢNG VND</th><th>Trạng thái</th></tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#history-withdraw-finish').html(html);
            $('#list-yourinvests').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'code'
                }, {
                    data: 'amount'
                },
                 {
                    data: 'status'
                }
                ]
            });
            
        }
    });
}

function load_withdraw_finish_vnd() {
    $.ajax({
        url: "/account/balance/history-withdraw-finish-vnd",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestsaa" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>MÃ RÚT TIỀN</th> <th>LƯỢNG VND</th><th>Trạng thái</th></tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#withdraw-finish-all-vnd').html(html);
            $('#list-yourinvestsaa').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'code'
                }, {
                    data: 'amount'
                },
                 {
                    data: 'status'
                }
                ]
            });
            $('.loading_bar_vnd_withdraw').hide();
        }
    });
}

function load_deposit_finish_stc() {
    $.ajax({
        url: "/account/balance/history-deposit-finish-stc",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestsssaaaa" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Số lượng </th> <th>Đơn vị</th><th>Trạng thái</th><th>Txid</th></tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#history-deposit-finishss').html(html);
            $('#list-yourinvestsssaaaa').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'status'
                },
                 {
                    data: 'txid'
                }
                ]
            });
            $('.loading_bar_stc').hide();
            $('.history_loading_stc').show();
        }
    });
}

function load_deposit_finishs_stc() {
    $.ajax({
        url: "/account/balance/history-deposit-pending-stc",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestsss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Số lượng </th> <th>Đơn vị</th><th>Trạng thái</th><th>Txid</th></tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#history-deposit-finish-stc').html(html);
            $('#list-yourinvestsss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'status'
                },
                 {
                    data: 'txid'
                }
                ]
            });
            $('.loading_bar_stc').hide();
            $('.history_loading_stc').show();
        }
    });
}


function load_withdraw_finish_stc() {
    $.ajax({
        url: "/account/balance/history-withdraw-finish-stc",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvests" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Số lượng </th> <th>Địa chỉ ví</th><th>Trạng thái</th><th>Txid</th></tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#history-withdraw-finish').html(html);
            $('#list-yourinvests').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'wallet'
                },
                 {
                    data: 'status'
                },
                 {
                    data: 'txid'
                }
                ]
            });
            
        }
    });
}

function load_withdraw_pendding_stc() {
    $.ajax({
        url: "/account/balance/history-withdraw-pending-stc",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            
            var html = `<div class="material-datatables"> <table border="1" cellpadding="0" cellspacing="0"  style="border-collapse:collapse;"  id="list-yourinvestwithdraws" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Thời gian</th>  <th>Số lượng </th> <th>Địa chỉ ví</th><th>Trạng thái</th> </tr> </thead> <tbody class="text-center"> </tbody> </table> </div> `;
            $('#history-withdraw-pending').html(html);
            $('#list-yourinvestwithdraws').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'wallet'
                },
                 {
                    data: 'status'
                }
                ]
            });
            
        }

    });
    
}

function remove_order(){
   
    $('.remove_order').on('click',function(){
        
        $.ajax({
            url: "/account/balance/remove-withdraw",
            data: {
                'id' : $(this).data('id')
            },
            type: "POST",
            async : true,
            beforeSend: function() {
            },
            error: function(data) {
            },
            success: function(data) {
                location.reload('true');
            }
        });
    });
}


function load_price(){
    $.ajax({
        url: "/get-price",
        data: {
            'id' : $(this).data('id')
        },
        type: "GET",
        async : true,
        beforeSend: function() {
        },
        error: function(data) {
        },
        success: function(data) {
            $('.price-content .price_buy').html(data.buy+' VND');
            $('.price-content .price_sell').html(data.sell+' VND');
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