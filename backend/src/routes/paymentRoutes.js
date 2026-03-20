const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/airtime', authMiddleware, paymentController.payAirtime);
router.post('/electricity', authMiddleware, paymentController.payElectricity);
router.post('/bill', authMiddleware, paymentController.payBill);
router.post('/voucher', authMiddleware, paymentController.buyVoucher);

module.exports = router;
