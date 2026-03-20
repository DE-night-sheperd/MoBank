const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/wallet', authMiddleware, cryptoController.getWallet);
router.get('/prices', authMiddleware, cryptoController.getPrices);
router.post('/buy', authMiddleware, cryptoController.buyCrypto);

module.exports = router;
