const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Mock function for sending OTP (e.g., Twilio integration)
const sendOTPViaTwilio = async (phone, otp) => {
  console.log(`Sending OTP ${otp} to phone number ${phone} via Twilio...`);
  // Twilio integration logic here
  // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await twilio.messages.create({ body: `Your MoBank OTP is: ${otp}`, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
};

// Request OTP controller
exports.requestOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // For development, use a fixed OTP or log the generated one
  const otp = process.env.NODE_ENV === 'production' ? Math.floor(100000 + Math.random() * 900000).toString() : '123456';

  try {
    // Save OTP to Redis with 5 min expiry
    await redisClient.setEx(`otp:${phone}`, 300, otp);

    // In development, log the OTP so we can see it
    console.log(`[AUTH] OTP for ${phone}: ${otp}`);

    res.status(200).json({ 
      message: `OTP sent successfully to ${phone}. (Dev Code: ${otp})` 
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP controller
exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  try {
    // Retrieve OTP from Redis
    const storedOTP = await redisClient.get(`otp:${phone}`);

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP verified, remove it from Redis
    await redisClient.del(`otp:${phone}`);

    // Check if user exists in the database
    const userQuery = 'SELECT * FROM users WHERE phone = $1';
    const userResult = await db.query(userQuery, [phone]);

    let user;
    if (userResult.rows.length === 0) {
      // Create new user if they don't exist (registration)
      const newUserQuery = 'INSERT INTO users (phone, balance) VALUES ($1, $2) RETURNING *';
      const newUserResult = await db.query(newUserQuery, [phone, 0.00]);
      user = newUserResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, phone: user.phone, balance: user.balance }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
