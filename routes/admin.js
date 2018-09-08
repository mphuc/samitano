'use strict'

const express = require('express');
const AdminCtrl = require('../controllers/admin');
const InvestCtrl = require('../controllers/admin/invest');
const IcoAdminCtrl = require('../controllers/admin/ico');
const BankAdminCtrl = require('../controllers/admin/bank');
const WithdrawAdminCtrl = require('../controllers/admin/withdraw');
const DepositAdminCtrl = require('../controllers/admin/deposit');
const SupportAdminCtrl = require('../controllers/admin/support');
const MarketHistory = require('../controllers/admin/markethistory');

const auth = require('../middlewares/authAdmin');
const router = express.Router();

/*SUPPORT*/
router.get('/admin/support', auth, SupportAdminCtrl.ListSupport);
router.get('/admin/support/ticket/:token', auth, SupportAdminCtrl.ViewTicker);
router.post('/admin/support/ticket/reply-support', auth, SupportAdminCtrl.SubmitReplySupport);
/*RUTAS*/
router.get('/admin', auth, AdminCtrl.Index);


router.get('/admin/dashboard', auth, AdminCtrl.Dahboard);
router.get('/admin/customer', auth, AdminCtrl.Customer);
router.get('/admin/edit/customer/:id', auth, AdminCtrl.EditCustomer);

router.get('/admin/order-buy', auth, AdminCtrl.ListOrderBuy);
router.get('/admin/order-sell', auth, AdminCtrl.ListOrderSell);
/*ICO*/
router.get('/admin/ico', auth, IcoAdminCtrl.ListIco);
router.get('/admin/ico-history', auth, IcoAdminCtrl.ListIcohistory);
router.get('/admin/ico/cancel/:id', auth, IcoAdminCtrl.CanelICO);
router.get('/admin/ico/matched/:id', auth, IcoAdminCtrl.MatchedICO);

router.get('/admin/ico/endico/', auth, IcoAdminCtrl.EndICO);
router.get('/admin/ico/startico/', auth, IcoAdminCtrl.StartICO);

router.post('/admin/ico/totalbuy', auth, IcoAdminCtrl.TotalBuy);
/*END ICO*/

/*Withdraw*/
router.get('/admin/withdraw', auth, WithdrawAdminCtrl.ListWithdraw);
router.get('/admin/withdraw-history', auth, WithdrawAdminCtrl.ListWithdrawhistory);
router.get('/admin/withdraw-enlable', auth, WithdrawAdminCtrl.WithdrawEnlable);
router.get('/admin/withdraw-disable', auth, WithdrawAdminCtrl.WithdrawDisable);
/*End Withdraw*/

/*Deposit*/
router.get('/admin/deposit', auth, DepositAdminCtrl.ListDeposit);
router.get('/admin/deposit/deposit-recieve', auth, DepositAdminCtrl.DepositRecieve);

/*End Deposit*/

router.get('/admin/invest', auth, InvestCtrl.ListInvest);
router.get('/wqwqeqweerysdfsfsfsfs/CaculateProfit', InvestCtrl.CaculateProfit);
router.post('/admin/updateUser', auth, AdminCtrl.updateUser);

router.get('/admin/invest/payment/:id', auth, InvestCtrl.SubmitInvest);

router.get('/admin/market-history', auth, MarketHistory.ListMarketHistory);

router.get('/admin/bank', auth, BankAdminCtrl.BankTempelte);
router.get('/admin/new-bank', auth, BankAdminCtrl.NewBankTempelte);
router.post('/admin/new-bank', auth, BankAdminCtrl.SubmitNewBankTempelte);
router.get('/admin/remove-bank/:id', auth, BankAdminCtrl.RemoveBank);
router.get('/admin/edit-bank/:id', auth, BankAdminCtrl.EditBankTemplete);
router.post('/admin/edit-bank/:id', auth, BankAdminCtrl.SubmitEditBankTemplete);
module.exports = router;