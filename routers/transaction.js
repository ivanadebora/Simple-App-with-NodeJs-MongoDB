const express = require('express');
const router = express.Router()
const {topup,payment,transfer,transactions} = require('../controllers/transaction')

router.post('/topup', topup)
router.post('/payment', payment)
router.post('/transfer', transfer)
router.get('/transactions', transactions)

module.exports = router