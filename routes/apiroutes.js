'use strict'

const express = require('express');
const CtrlApi = require('../controllers/api/ticker');
const api = express.Router();

api.get('/tickersss', CtrlApi.getTicker);


module.exports = api;

