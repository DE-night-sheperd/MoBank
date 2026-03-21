const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/list', authMiddleware, subscriptionController.listSubscriptions);
router.post('/create', authMiddleware, subscriptionController.createSubscription);

module.exports = router;
