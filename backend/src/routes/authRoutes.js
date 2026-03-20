const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to request OTP for a phone number
router.post('/request-otp', authController.requestOTP);

// Route to verify OTP and login/register user
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
