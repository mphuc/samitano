'use strict'

const express = require('express');
const MarketCtrl = require('../controllers/exchange/market');
const AutosCtrl = require('../controllers/exchange/auto');
const ChartCtrl = require('../controllers/exchange/chart');
const Dashboard = require('../controllers/exchange/dashboard');
const Page = require('../controllers/exchange/page');


const auth = require('../middlewares/auth');

const router = express.Router();
/*Dashboard*/
//router.get('/Dashboard', Dashboard.Indexs);


router.get('/Index',auth, MarketCtrl.Indexs);

router.post('/submit-buy',auth, MarketCtrl.SubmitBuy);
router.post('/submit-sell',auth, MarketCtrl.SubmitSell);
router.post('/cancel-order-open',auth, MarketCtrl.CancelOrder);
router.post('/reload-balance',auth, MarketCtrl.ReloadBalance);
router.get('/loadorder-exchange-buy',auth, MarketCtrl.LoadOrder_buyAll);
router.get('/loadorder-exchange-sell',auth, MarketCtrl.LoadOrder_sellAll);
router.get('/load-order-open',auth, MarketCtrl.LoadOrder_Open_id);
router.get('/load-exchange-makethistory', MarketCtrl.LoadMarketHistory);
router.get('/load-exchange-mymakethistory',auth, MarketCtrl.LoadMyMarketHistory);
router.get('/load-volume', MarketCtrl.LoadVolume);
router.post('/load-ticker', MarketCtrl.load_ticker);

router.get('/Order',auth, MarketCtrl.TempalteOrder);

router.get('/load-chart/:MarketName', ChartCtrl.LoadTempalate);
router.get('/load-json-chart/:MarketName', ChartCtrl.get_json_chart);

router.get('/Fees', Page.LoadTempalateFee);
/*router.get('/Api', Page.LoadTempalateApi);
router.get('/api/info/:MarketName', Page.Api_SFCC);*/
router.get('/exchange', MarketCtrl.create_session);



module.exports = router;