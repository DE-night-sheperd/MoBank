const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, userController.getMe);
router.post('/link-card', authMiddleware, userController.linkCard);
router.post('/set-pin', authMiddleware, userController.setPin);
router.post('/toggle-2fa', authMiddleware, userController.toggle2FA);
router.post('/top-up', authMiddleware, userController.createTopUpSession);
router.post('/kyc', authMiddleware, userController.uploadKYC);

module.exports = router;
