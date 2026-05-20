const express = require('express');
const { getEthPrice } = require('../controllers/ethPriceController');

const router = express.Router();

router.get('/eth-price', getEthPrice);

module.exports = router;
