'use strict'

const express = require('express');
const UserController = require('../controllers/user');
const request = require('request');
const crlUserLogin = require('../controllers/user/login');
const crlUserActive = require('../controllers/user/active');
const crlUserRegister = require('../controllers/user/register');

const HomeController = require('../controllers/home');
const InvestController = require('../controllers/invest');
const DashboardController = require('../controllers/dashboard');
const SettingController = require('../controllers/setting');
const AffiliateController = require('../controllers/affiliate');
const ExchangeController = require('../controllers/exchange');
const FaqController = require('../controllers/faq');
const PartnershipsController = require('../controllers/partnerships');
const HistoryController = require('../controllers/history');
const WithdrawController = require('../controllers/withdraw');
const WalletController = require('../controllers/wallet');
const auth = require('../middlewares/auth');
const capchaControlelr = require('../controllers/capcha');
const InviteController = require('../controllers/invite');
const BalanceController = require('../controllers/balance');
const IcoCtrl = require('../controllers/ico');
const Auto_crontab = require('../controllers/auto');
const SupportController = require('../controllers/support');
const SetupCtrl = require('../controllers/setup');
const TickerCtrl = require('../controllers/ticker');
const UploadCtrl = require('../controllers/upload');

const CreateCtrl = require('../controllers/create');
const OffersCtrl = require('../controllers/offers');
const TradesCtrl = require('../controllers/trades');
const QuickCtrl = require('../controllers/quick');
const router = express.Router();


router.get('/support', auth, SupportController.Index);
router.get('/new-support', auth, SupportController.NewSupport);
router.post('/account/support/new-support', auth, SupportController.SubmitNewSupport);
router.get('/support/ticket/:token', auth, SupportController.ViewTicker);
router.post('/account/support/reply-support', auth, SupportController.SubmitReplySupport);


router.get('/dashboard', auth, DashboardController.DashboardTemplate);
router.get('/referral_program', auth, DashboardController.ReferralProgramTemplate);
router.get('/wallet-stc', DashboardController.Wallet_STC);

router.get('/load-order-buy', DashboardController.LoadOrder_buyAll);
router.get('/load-order-sell', DashboardController.LoadOrder_sellAll);
router.get('/load-order-open',auth, DashboardController.LoadOrderOpen);
router.get('/load-order-close',auth, DashboardController.LoadOrderClose);

router.get('/load-buy-now', DashboardController.LoadOrder_buyNOW);
router.get('/load-sell-now', DashboardController.LoadOrder_sellNOW);
router.get('/get-price', DashboardController.get_price_stc);

router.get('/load-order-buy-user',auth, DashboardController.LoadOrderBuyUser);
router.get('/load-order-sell-user',auth, DashboardController.LoadOrderSellUser);
router.get('/load-reffrall',auth, DashboardController.LoadReffrallUser);

router.post('/account/wallet', auth, WalletController.Index);

router.get('/setting', auth, SettingController.Index);

var multer  = require('multer');
var upload = multer({ dest: '/tmp/'});
router.post('/account/setting/file_upload',auth,upload.single("file"), SettingController.Uploadfile);

router.post('/account/setting/personal', auth, SettingController.updatePersonal);
router.post('/account/setting/authy', auth, SettingController.authy);
router.post('/account/setting/password', auth, SettingController.changePasswrd);
router.get('/tokenactive', SettingController.active);

router.get('/affiliate', auth, AffiliateController.Indexmain);
router.get('/account/affiliate/tree', auth, AffiliateController.Treerefferal);
router.get('/account/affiliate/refferal', auth, AffiliateController.Indexrefferal);
router.get('/account/affiliate/promo-materials', auth, AffiliateController.Indexpromo);
router.post('/account/refferal', auth, AffiliateController.getRefferal);
// history
// router.get('/history.html', auth, HistoryController.HistoryHtml);
router.post('/account/transaction', auth, HistoryController.Index);

//Invite Friends
router.get('/invite-friend', auth, InviteController.InviteHtml);
// Exchange
router.get('/exchange',  ExchangeController.Index);


router.get('/balance', auth, BalanceController.Balance);
router.get('/balance/vnd', auth, BalanceController.BalanceVND);
router.get('/balance/stc', auth, BalanceController.BalanceSTC);

router.post('/account/balance/withdraw', auth, BalanceController.SubmitWithdraw);
router.post('/account/balance/wallet', auth, BalanceController.GetWallet);

router.get('/account/balance/history-withdraw-pending-stc', auth, BalanceController.getWithdraw_user_pendding_stc);
router.get('/account/balance/history-deposit-pending-stc', auth, BalanceController.getDeposit_user_pendding_stc);

router.get('/account/balance/history-withdraw-finish-vnd', auth, BalanceController.getWithdraw_user_finish_vnd);
router.get('/account/balance/history-withdraw-history-vnd', auth, BalanceController.getWithdraw_user_history_vnd);
router.get('/account/balance/history-deposit-finish-vnd', auth, BalanceController.getDeposit_user_finish_vnd);
router.get('/account/balance/history-deposit-history-vnd', auth, BalanceController.getDeposit_user_finish_vnd_history);

router.get('/account/balance/history-withdraw-finish-stc', auth, BalanceController.getWithdraw_user_finish_stc);

router.get('/account/balance/history-deposit-finish-stc', auth, BalanceController.getDeposit_user_finish_stc);
router.post('/account/balance/remove-withdraw', auth, BalanceController.Remove_Withdraw);
router.post('/account/balance/deposit-vnd', auth, BalanceController.Deposit_VND);
router.get('/account/balance/cancel-deposit-vnd', auth, BalanceController.CancelDeposit_VND);
router.get('/account/balance/cancel-withdraw-vnd', auth, BalanceController.CancelWidthdraw_VND);
router.get('/account/balance/cancel-withdraw-stc', auth, BalanceController.CancelWidthdraw_STC);
router.post('/account/balance/withdraw-vnd', auth, BalanceController.WidthdrawVnd);
router.get('/get-account-bank/:accountnumber', BalanceController.GetVietCombank);


router.get('/token_crt', BalanceController.create_token);


router.get('/wallet/walletnotify/:txid', WalletController.Notify);
router.get('/wallet/walletnotifybtc/:txid', WalletController.NotifyBTC);
router.get('/wallet/walletnotifybtg/:txid', WalletController.NotifyBTG);



router.get('/two-factor-auth', UserController.getAuthy);
router.get('/logout', UserController.logOut);

router.get('/signup', crlUserRegister.getTemplateRegister);
//router.get('/register-success', crlUserRegister.getTemplateSuccess);
router.post('/signUp', crlUserRegister.signUp);

router.post('/Authy', UserController.checkAuthy);

router.post('/signIn', crlUserLogin.signIn);
router.get('/verify-account', crlUserActive.active);
//router.get('/active', crlUserActive.active);
router.get('/change-password', crlUserLogin.ChangePassword);
router.post('/change-password-submit', crlUserLogin.ChangePasswordSubmit);

router.get('/forgot-password', crlUserLogin.getTemplateforgot);
router.post('/ForgotPassword', crlUserLogin.ForgotPassword);

router.get('/signin', crlUserLogin.getTemplateLogin);

router.get('/resend-active-email', crlUserLogin.ResendMailTempalte);
router.post('/ResendMail', crlUserLogin.ResendMailSubmit);

// FAQS
router.get('/faq',FaqController.Index);


router.get('/test', auth , (req,res)=>{ 
	res.status(200).send({message: req.session});
});

router.get('/api/auth', auth);

router.get('/', DashboardController.IndexOn);
router.get('/wallet', HomeController.getTemplateWallet);

router.get('/get-price-coin', IcoCtrl.get_price_coin);

router.get('/capcha.png', capchaControlelr.capchaImage);

router.get('/api/price', TickerCtrl.LoadPrice);


router.get('/setup', SetupCtrl.Setup);

router.post('/images/upload', UploadCtrl.UploadImage);



router.get('/offers/create',auth, CreateCtrl.TempalteCreate);
router.post('/offers/create/buysubmit',auth, CreateCtrl.CreateBuy);
router.get('/offers/create-buy/:id_order',auth, CreateCtrl.TempalteCreateBuyFinish);
router.get('/offers/create-buy/pause/:id_order',auth, CreateCtrl.OrderBuyPause);
router.get('/offers/create-buy/start/:id_order',auth, CreateCtrl.OrderBuyStart);
router.get('/offers/create-buy/remove/:id_order',auth, CreateCtrl.OrderBuyRemove);
router.get('/offers/create-buy/edit/:id_order',auth, CreateCtrl.TempalteEditBuyOrder);
router.post('/offers/edit/buy',auth, CreateCtrl.EditBuySubmit);

router.post('/offers/create/sellsubmit',auth, CreateCtrl.CreateSell);
router.get('/offers/create-sell/:id_order',auth, CreateCtrl.TempalteCreateSellFinish);
router.get('/offers/create-sell/pause/:id_order',auth, CreateCtrl.OrderSellPause);
router.get('/offers/create-sell/start/:id_order',auth, CreateCtrl.OrderSellStart);
router.get('/offers/create-sell/remove/:id_order',auth, CreateCtrl.OrderSellRemove);
router.get('/offers/create-sell/edit/:id_order',auth, CreateCtrl.TempalteEditSellOrder);
router.post('/offers/edit/sell',auth, CreateCtrl.EditSellSubmit);




router.get('/offers/buy/:id_order',auth, OffersCtrl.TempalteOffersBuy);
router.post('/offers/submitbuy',auth, OffersCtrl.SubmitBuy);
router.post('/offers/submitsell',auth, OffersCtrl.SubmitSell);

router.get('/offers/buynow/:id_order/:amount',auth, OffersCtrl.SubmitBuyNow);
router.get('/offers/sellnow/:id_order/:amount',auth, OffersCtrl.SubmitSellNow);

router.get('/offers/sell/:id_order',auth, OffersCtrl.TempalteOffersSell);

router.get('/trades-buy/:id_trades',auth, TradesCtrl.TempalteTradesBuy);
router.get('/trades-buy/cancel/:id_trades',auth, TradesCtrl.CancelTradesBuy);
router.get('/trades-buy/confirm/:id_trades',auth, TradesCtrl.ConfirmTradesBuy);

router.get('/trades-sell/:id_trades',auth, TradesCtrl.TempalteTradesSell);
router.get('/trades-sell/cancel/:id_trades',auth, TradesCtrl.CancelTradesSell);
router.get('/trades-sell/confirm/:id_trades',auth, TradesCtrl.ConfirmTradesSell);

router.get('/quick',auth, QuickCtrl.TempalteQuick);


module.exports = router;