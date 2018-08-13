'use strict';


$(document).ready(function($) {
        gethost($('#displayName').val());
    if (location.pathname == "/affiliate.html") {
        LoadRefferal();
    }
 
    if (location.pathname == "/account-deposits.html") {
        loadYourdeposit();
    }

    if (location.pathname == "/history.html") {
        LoadTransaction('lending');
        LoadTransactionLEC('LEC');
        loadWithdraw();
    }
    

    setTimeout(function() {
        $('.hidden_js').show();
    }, 200);

    //getTicker();

    function getTicker() {
        $.get("/ticker", function(data) {
            $('.price_lec_usd').html('($'+data.ast_usd+')');
            $('.price_lec_btc').html(data.ast_btc+' BTC');
            $('.price_lec_eth').html(data.ast_eth+' ETH');
            $('.price_btc_usd').html('$'+data.btc_usd);
            $('#rate_coin').val(data.ast_usd);
            $('#ast_btc').val(data.ast_btc);
            $('#btc_usd').val(data.btc_usd);
            $('.price_ast_usd').html(data.ast_usd);
        });
    }
    setInterval(function() {
        //getTicker();
    }, 7000);

    
});
function loadTree(){
    $('#TreeSystem').jstree({
            'core' : {
               'data' : {
                  "url" : "https://api.sfccoin.co/api/treesystem/json_tree/"+$('#refuid').val(),
                  "dataType" : "json"
               }
            }
         });
}

function gethost(name) {

    var protocol = document.location.protocol;
    var host = document.location.host;
    var url = protocol + '//' + host + '?affiliate=' + name;
    $('.refferal_link').val(url);


    $('.solid-plu a').each(function(idx, elem) {
    
        $(this).attr('href', $(this).attr('href').replace('link', url));
    });
}
var form_invest = $('#frmInvest');
var form_transfer = $('#frmTransfer');
var form_withdraw_coin = $('#frmWithdrawCOIN');
var form_withdraw_btc = $('#frmWithdrawBTC');
var self = {
    form_invest: form_invest,
    amountInputs: form_invest.find('#amount'),
    amountInputCoin: form_invest.find('#amount_coin'),
    btnInvest: form_invest.find('button'),
    cardDashboard: $('.dashboard-balance'),
    btnDepositBalance: $('.deposits'),
    menudDeposit: $('#your_invest'),
    form_transfer: form_transfer,
    amountUSDtransfer: form_transfer.find('#amount_transfer'),
    amountCointransfer: form_transfer.find('#amount_coin_transfer'),
    btnTransfer: form_transfer.find('button.btnConfirm'),
    WithdrawSubmit: $('.WithdrawSubmit'),
    form_withdraw_btc: form_withdraw_btc,
    form_withdraw_coin: form_withdraw_coin,
    amount_withdraw: {
        btc: form_withdraw_btc.find('#amount_btc_withdraw'),
        coin: form_withdraw_coin.find('#amount_coin_withdraw')
    },
    amount_usd_withdraw: {
        btc: form_withdraw_btc.find('#amount_usd_btc_withdraw'),
        coin: form_withdraw_coin.find('#amount_usd_coin_withdraw')
    },
    wallet_withdraw: {
        btc: form_withdraw_btc.find('#btc_wallet'),
        coin: form_withdraw_coin.find('#ast_wallet')
    },
};
$('#amount_btc_withdraw').on("change paste keyup", function() {
    var btc_usd = $('#btc_usd').val();
    $('#amount_usd_btc_withdraw').val((parseFloat($('#amount_btc_withdraw').val()) * parseFloat(btc_usd)).toFixed(2));
});
$('#amount_coin_withdraw').on("change paste keyup", function() {
    var ast_usd = $('#rate_coin').val();
    $('#amount_usd_coin_withdraw').val((parseFloat($('#amount_coin_withdraw').val()) * parseFloat(ast_usd)).toFixed(2));
});
self.WithdrawSubmit.click(function(e) {
    var type = $(this).data('type');
    var amount = parseFloat(self.amount_withdraw[type].val()).toFixed(8);
    var wallet = self.wallet_withdraw[type].val();
    $.ajax({
        url: "/account/withdraw",
        data: {
            amount: self.amount_withdraw[type].val(),
            type: type,
            wallet: wallet,
            password: $('#send_password').val()
        },
        type: "POST",
        beforeSend: function() {
            self.WithdrawSubmit.button('loading');
        },
        error: function(data) {
            var message = data.responseJSON.message;
            showNotification('top', 'right', message, 'danger');
            self.WithdrawSubmit.button('reset');
            setTimeout(function() {
                location.reload(true);
            }, 1000);
        },
        success: function(data) {
            swal({
                title: "Withdraw Success",
                text:"Please check your mailbox to complete withdraw!",
                timer: 2000,
                showConfirmButton: false
            }).catch(swal.noop);
            setTimeout(function() {
                location.reload(true);
            }, 5000);
        }
    });
});
self.amountInputs.on("change paste keyup", function() {
    var amount = self.amountInputs.val();
    var price_usd = $('#rate_coin').val();
    if (isNaN(amount)) {
        self.amountInputs.val('0');
        self.amountInputCoin.val('0');
        self.amountInputs.addClass('error').attr('placeholder', 'Please enter is number!');
        $('.p100').removeClass('pactive');
        return false;
    } else {
        self.amountInputs.removeClass('error').attr('placeholder', 'Amount');
    }
    if (parseFloat(amount) < 100 || parseFloat(amount) > 100000 || parseFloat(amount) % 10 != 0) {
        $('.p100').removeClass('pactive');
        self.amountInputs.addClass('error').attr('placeholder', 'Please enter amount > 100$!');
        return false;
    }(parseFloat(amount) >= 100 && parseFloat(amount) < 999) ? $('.p100').addClass('pactive'): $('.p100').removeClass('pactive');
    (parseFloat(amount) >= 1000 && parseFloat(amount) < 4990) ? $('.p1000').addClass('pactive'): $('.p1000').removeClass('pactive');
    (parseFloat(amount) >= 5000 && parseFloat(amount) < 10000) ? $('.p5000').addClass('pactive'): $('.p5000').removeClass('pactive');
    (parseFloat(amount) >= 10000 && parseFloat(amount) < 100000) ? $('.p10000').addClass('pactive'): $('.p10000').removeClass('pactive');
    var rate = parseFloat(self.amountInputs.val()) / parseFloat(price_usd);
    self.amountInputCoin.val(parseFloat(rate).toFixed(8));
});
self.amountUSDtransfer.on("change paste keyup", function() {
    var price_usd = $('#rate_coin').val();
    var amount = self.amountUSDtransfer.val();
    if (isNaN(amount)) {
        self.amountUSDtransfer.val('0');
        self.amountCointransfer.val('0');
        self.amountUSDtransfer.addClass('error').attr('placeholder', 'Please enter is number!');
        return false;
    } else {
        self.amountUSDtransfer.removeClass('error').attr('placeholder', 'Amount');
    }
    if (parseFloat(amount) < 5) {
        self.amountUSDtransfer.addClass('error').attr('placeholder', 'Please enter amount > 5$!');
        return false;
    }
    var rate = parseFloat(self.amountUSDtransfer.val()) / parseFloat(price_usd);
    self.amountCointransfer.val(parseFloat(rate).toFixed(8));
});
self.btnInvest.click(function(evt) {
    evt.preventDefault();
    invest();
});

function invest() {
    $.ajax({
        url: "/account/invest",
        data: {
            amount: parseFloat(self.amountInputs.val()).toFixed(8)
        },
        type: "POST",
        beforeSend: function() {
            var amount = self.amountInputs.val();
            if (isNaN(amount) || amount == "" || parseFloat(amount) % 10 != 0) {
                self.amountInputs.val('0');
                self.amountInputCoin.val('0');
                self.amountInputs.addClass('error').attr('placeholder', 'Please enter is number and divide by 10!');
                return false;
            } else {
                self.amountInputs.removeClass('error').attr('placeholder', 'Amount');
            }
            if (parseFloat(amount) < 100 || parseFloat(amount) > 100000 || amount == "" || parseFloat(amount) % 10 != 0) {
                self.amountInputs.addClass('error').attr('placeholder', 'Please enter amount > 100$ and divide by 10!');
                return false;
            }
            self.btnInvest.button('loading');
        },
        error: function(data) {
            var message = data.responseJSON.message;
            showNotification('top', 'right', message, 'danger');
            self.btnInvest.button('reset');
        },
        success: function(data) {
            $('.balnace_coin').html(data.balance);
            self.amountInputs.val('0');
            self.amountInputCoin.val('0');
            setTimeout(function() {
                $('#ModalInvest').modal('hide');
                self.btnInvest.button('reset');
                swal("Success!", "Create new Invest success!", "success");
            }, 1000);
        }
    });
}
self.btnTransfer.click(function(evt) {
    evt.preventDefault();
    var amount = self.amountUSDtransfer.val();
    if (isNaN(amount) || amount == "") {
        self.amountUSDtransfer.val('0');
        self.amountCointransfer.val('0');
        self.amountUSDtransfer.addClass('error').attr('placeholder', 'Please enter is number');
        return false;
    } else {
        self.amountUSDtransfer.removeClass('error').attr('placeholder', 'Amount');
    }
    if (parseFloat(amount) < 5) {
        self.amountUSDtransfer.addClass('error').attr('placeholder', 'Please enter amount > 5$!');
        return false;
    }
    swal({
        title: 'Are you sure want to exchange ' + amount + ' USD for ' + parseFloat(self.amountCointransfer.val()) + ' SFCC?',
        text: "",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, I agree!'
    }).then(function() {
        transferToCoin();
    })
});

function transferToCoin() {
    $.ajax({
        url: "/account/transfer",
        data: {
            amount: parseFloat(self.amountUSDtransfer.val()).toFixed(8)
        },
        type: "POST",
        beforeSend: function() {
            var amount = self.amountUSDtransfer.val();
            if (isNaN(amount) || amount == "") {
                self.amountUSDtransfer.val('0');
                self.amountCointransfer.val('0');
                self.amountUSDtransfer.addClass('error').attr('placeholder', 'Please enter is number');
                return false;
            } else {
                self.amountUSDtransfer.removeClass('error').attr('placeholder', 'Amount');
            }
            if (parseFloat(amount) < 5) {
                self.amountUSDtransfer.addClass('error').attr('placeholder', 'Please enter amount > 5$!');
                return false;
            }
            self.btnTransfer.button('loading');
        },
        error: function(data) {
            var message = data.responseJSON.message;
            showNotification('top', 'right', message, 'danger');
            self.btnTransfer.button('reset');
        },
        success: function(data) {
            $('.balnace_coin').html(data.balance_coin);
            $('.balance_lending').html(data.balance_lending);
            self.amountUSDtransfer.val('0');
            self.amountCointransfer.val('0');
            setTimeout(function() {
                $('#ModalTransfer').modal('hide');
                self.btnTransfer.button('reset');
                swal("Success!", "Transfer to BBL wallet success!", "success");
            }, 1000);
        }
    });
}


function LoadTransaction(wallet) {
    if (wallet == 'lending') {
        $('.balance-lending').css('border', '1px solid #f00');
    }
    $.ajax({
        url: "/account/transaction",
        data: {
            wallet: wallet
        },
        type: "POST",
        beforeSend: function() {
            $('#transaction-wallet').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
        },
        error: function() {},
        success: function(data) {
            if (data.history == undefined) {
                var html = ` <div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin" > </div> <h2>No transactions</h2></div> `;
                $('#transaction-wallet').html(html);
                return false;
            }
            var html = ` <div class="material-datatables"> <table id="list-transaction" class="table table-striped table-no-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th> <th>Amount</th> <th>Detail</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#transaction-wallet').html(html);
            $('#list-transaction').DataTable({
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
                data: data.history,
                columns: [{
                    "class": 'cls',
                    data: 'date'
                }, {
                    "class": 'cls',
                    data: 'amount'
                }, {
                    "class": 'cls',
                    data: 'detail'
                }],
                createdRow: function(row, data, index) {
                    $(row).attr("class", data.cls);
                }
            });
            setTimeout(function() {
                self.btnInvest.button('reset');
            }, 2000);
        }
    });
}
function LoadTransactionLEC(wallet) {
    if (wallet == 'lending') {
        $('.balance-lending').css('border', '1px solid #f00');
    }
    $.ajax({
        url: "/account/transaction",
        data: {
            wallet: wallet
        },
        type: "POST",
        beforeSend: function() {
            $('#transaction-wallet-lec').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
        },
        error: function() {},
        success: function(data) {
            if (data.history == undefined) {
                var html = ` <div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin" > </div> <h2>No transactions</h2></div> `;
                $('#transaction-wallet-lec').html(html);
                return false;
            }
            var html = ` <div class="material-datatables"> <table id="list-transaction-lec" class="table table-striped table-no-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th> <th>Amount</th> <th>Detail</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#transaction-wallet-lec').html(html);
            $('#list-transaction-lec').DataTable({
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
                data: data.history,
                columns: [{
                    "class": 'cls',
                    data: 'date'
                }, {
                    "class": 'cls',
                    data: 'amount'
                }, {
                    "class": 'cls',
                    data: 'detail'
                }],
                createdRow: function(row, data, index) {
                    $(row).attr("class", data.cls);
                }
            });
            setTimeout(function() {
                self.btnInvest.button('reset');
            }, 2000);
        }
    });
}
function loadWithdraw() {
    $.ajax({
        url: "/account/loadWithdraw",
        data: {
            data: '1'
        },
        type: "POST",
        beforeSend: function() {
            $('#your_withdraw').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
        },
        error: function() {
            var html = `<div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin" > </div> <h2>No transactions</h2>  </div> `;
            $('#your_withdraw').html(html);
        },
        success: function(data) {
            if (data.withdraw == undefined) {
                var html = ` <div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin" > </div> <h2>No transactions</h2> </div> `;
                $('#your_withdraw').html(html);
                return false;
            }
            var html = ` <div class="material-datatables"> <table id="list-withdraw" class="table table-striped table-no-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th> <th>Amount</th> <th>Currency</th> <th>Status</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#your_withdraw').html(html);
            $('#list-withdraw').DataTable({
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
                data: data.withdraw,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                }, {
                    data: 'status'
                }],
            });
        }
    });
}

function loadYourdeposit() {
    $.ajax({
        url: "/account-deposits.html",
        data: {
            data: '1'
        },
        type: "POST",
        beforeSend: function() {
            $('#transaction-wallet').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
        },
        error: function() {},
        success: function(data) {
            if (data.invest == undefined) {
                var html = ` <p >Your Investment</p> <div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin" > </div> <h2>No transactions</h2> </div> `;
                $('#your_investment').html(html);
                return false;
            }
            var html = ` <p >Your Investment</p> <div class="material-datatables"> <table id="list-yourinvest" class="table table-striped table-no-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th> <th>Expire</th> <th>Amount Invest</th> <th>Interest</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#your_investment').html(html);
            $('#list-yourinvest').DataTable({
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
                data: data.invest,
                columns: [{
                    data: 'date'
                }, {
                    data: 'expire'
                }, {
                    data: 'amount'
                }, {
                    data: 'interest'
                }]
            });
            setTimeout(function() {
                self.btnInvest.button('reset');
            }, 2000);
        }
    });
}

function LoadRefferal() {
    $.ajax({
        url: "/account/refferal",
        data: {
            data: 1
        },
        type: "POST",
        beforeSend: function() {},
        error: function() {
            var html = ` <div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin"> </div> <h2>Empty</h2> <div class="well"> <label>Refferal link:</label> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#link" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="link" type="text" value="" class="form-control refferal_link"> </div> <!-- /input-group --> </div> </div> `;
            $('#your_refferal').html(html);

            gethost($('#displayName').val());
        },
        success: function(data) {
            if (data.refferal == undefined) {
                var html = ` <div class="no-transaction text-center"> <div class="img-circle"> <img src="/static/img/1758-200.png" alt="Coin"> </div> <h2>Empty</h2> <div class="well"> <label>Personal Affiliate link:</label> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-default copy" data-clipboard-action="copy" data-clipboard-target="#link" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="link" type="text" value="" class="form-control refferal_link"> </div> <span class="help-block">You can use this personal affiliate link to invite your friends to COINREUM. In case someone visits us using this URL and sign up, they will be automatically added to Your Affiliates list.</span><!-- /input-group --> </div> </div> `;
                $('#your_refferal').html(html);
                return false;
            }
            var html = ` <div class="material-datatables"> <table id="list-refferal" class="table table-striped table-no-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Username</th> <th>Email</th> <th>Date</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#your_refferal').html(html);
            $('#list-refferal').DataTable({
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.refferal,
                columns: [{
                    data: 'displayName'
                }, {
                    data: 'email'
                }, {
                    data: 'signupDate'
                }]
            });
        }
    });
}
self.btnDepositBalance.click(function(evt) {
    evt.preventDefault();
    var wallet = $(this).data('wallet');
    depositBalance(wallet);
    ShowAddress();
});

function depositBalance(wallet) {
    $.ajax({
        url: "/account/wallet",
        data: {
            wallet: wallet
        },
        type: "POST",
        beforeSend: function() {
            $('#ModalDeposit-label').html('SFCC Wallet Address');
            $('#ModalDeposit .modal-body').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
        },
        error: function(data) {
            var message = data.responseJSON.message;
            showNotification('top', 'right', message, 'danger');
            $('#ModalDeposit').modal('hide');
        },
        success: function(data) {
            setTimeout(function() {
                self.btnDepositBalance.button('reset');
                $('#ModalDeposit .modal-body').html('');
                var text = wallet == 'BTC' ? 'Bitcoin' : 'Sfccoin';
                var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                $('#ModalDeposit .modal-body').html(html);
                ShowAddress();
                $('#inputaddress').val(data.wallet);
                $('#address-qr').html('<img src="https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl=' + data.wallet + '" alt="">');
            }, 1000);
        }
    });
}

function ShowAddress() {
    $('.show-address').click(function(evt) {
        evt.preventDefault();
        $('.AccountDepositAddress_block').css('display', 'none');
    });
}
$('.Logout').click(function(evt) {
    evt.preventDefault();
    swal({
        title: 'Are you sure?',
        text: 'You will logout system!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-danger",
        buttonsStyling: false
    }).then(function() {
        swal({
            title: 'Logout!',
            text: 'You have logged out of the system! Thank you for using our service! See you again',
            type: 'success',
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false
        }).then(function() {
            localStorage.removeItem('token');
            window.location.href = '/logout';
        }, function(dismiss) {
            localStorage.removeItem('token');
            window.location.href = '/logout';
        })
    }, function(dismiss) {
        if (dismiss === 'cancel') {
            swal({
                title: 'Cancelled',
                text: ':)',
                type: 'error',
                confirmButtonClass: "btn btn-info",
                buttonsStyling: false
            }).catch(swal.noop);
        }
    })
});
$('#personalForm button').click(function(evt) {
    evt.preventDefault();
    personalForm();
});

function personalForm() {
    $.ajax({
        url: "/account/setting/personal",
        data: $('#personalForm').serialize(),
        type: "POST",
        beforeSend: function() {
            $('.alert-dismissable_infomation').hide();
            $('#personalForm button').button('loading');
        },
        error: function(data) {
            var message = data.responseJSON.message;
            if (message.length > 0) {
                for (var i = 0; i < message.length; i++) {
                    $('.alert-dismissable_infomation').html(message[i].msg).show();
                    break;
                    //showNotification('top', 'right', message[i].msg, 'danger');
                }
            }
            $('#personalForm button').button('reset');
        },
        success: function(data) {
            var message = data.message;
            ///showNotification('top', 'right', message, 'success');
            $('.alert-dismissable_infomation').html(message).show();
            $('#personalForm button').button('reset');
        }
    });
}
$('#btn_frm_GACode').click(function(evt) {
    evt.preventDefault();
    Authy();
});

function Authy() {
    $.ajax({
        url: "/account/setting/authy",
        data: {
            authy: $('#account_frm_GACode').val()
        },
        type: "POST",
        beforeSend: function() {
            $('#btn_frm_GACode').button('loading');
            $('.alert-dismissable_f2a').hide();
        },
        error: function(data) {

            var message = data.responseJSON.message;
            if (typeof message == 'string') {
                $('.alert-dismissable_f2a').show().html(message);
                
            } else {
                for (var i = 0; i < message.length; i++) {
                    $('.alert-dismissable_f2a').show().html(message[i].msg);
                    
                    break;
                }
            }
            $('#btn_frm_GACode').button('reset');
        },
        success: function(data) {
            $('.alert-dismissable_f2a').show().html('Update successful');
            
            setTimeout(function() {
                location.reload(true);
            }, 2000);
        }
    });
}
$('#frmChangePassword button').click(function(evt) {
    evt.preventDefault();
    changePasswrd();
});

function changePasswrd() {
    
    $.ajax({
        url: "/account/setting/password",
        data: $('#frmChangePassword').serialize(),
        type: "POST",
        beforeSend: function() {
            $('.alert-dismissable_pw').hide();
            $('#frmChangePassword button').button('loading');
        },
        error: function(data) {
            var message = data.responseJSON.message;
            
            if (typeof message == 'string') {
                $('.alert-dismissable_pw').show().html(message);
                //showNotification('top', 'right', message, 'danger');
            } else {
                for (var i = 0; i < message.length; i++) {
                    $('.alert-dismissable_pw').show().html(message[i].msg);
                    //showNotification('top', 'right', message[i].msg, 'danger');
                    break;
                }
            }
            $('#frmChangePassword button').button('reset');
            //$('#frmChangePassword').reset();
        },
        success: function(data) {
            var message = data.message;
            $('.alert-dismissable_pw').show().html('Update successful');
            
            setTimeout(function() {
                location.reload(true);
            }, 2000);
        }
    });
}

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
$(function() {
    $('#login_history').DataTable({
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
    });

    $('.table_balance').DataTable({
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
    });

    var table = $('#login_history').DataTable();
    var table = $('.table_balance').DataTable();
})



