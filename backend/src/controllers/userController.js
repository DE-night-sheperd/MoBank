const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

exports.createTopUpSession = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 100) return res.status(400).json({ error: 'Minimum top-up is R100' });

  try {
    // In a real app, this would create a Stripe Checkout Session
    // For this modern touch demo, we'll simulate a successful payment 
    // and instantly credit the mock balance if no key is found.
    
    if (process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'zar',
            product_data: { name: 'MoBank Balance Top-up' },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/?payment=cancel`,
      });
      res.status(200).json({ url: session.url });
    } else {
      // Mock success for demo
      await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, req.user.userId]);
      res.status(200).json({ message: 'Mock payment successful! R'+amount+' added to balance.' });
    }
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, phone, balance, transaction_pin IS NOT NULL as pin_set, two_factor_enabled, kyc_status FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cardsResult = await db.query('SELECT id, card_number, card_holder, expiry_date, card_type FROM cards WHERE user_id = $1', [req.user.userId]);
    
    // Mask card numbers for security
    const cards = cardsResult.rows.map(card => ({
      ...card,
      card_number: `**** **** **** ${card.card_number.slice(-4)}`
    }));

    // Get Announcements and Updates (Mocked for now)
    const announcements = [
      { id: 1, title: 'Welcome to MoBank', content: 'Experience the future of digital banking today.', date: '2024-03-20' },
      { id: 2, title: 'Solana Network Active', content: 'You can now onramp SOL directly from your dashboard.', date: '2024-03-22' }
    ];

    res.status(200).json({
      user: userResult.rows[0],
      cards: cards,
      announcements: announcements
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.uploadKYC = async (req, res) => {
  const { docType, docNumber } = req.body;
  if (!docType || !docNumber) return res.status(400).json({ error: 'Document type and number required' });

  try {
    await db.query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['verified', req.user.userId]);
    res.status(200).json({ message: 'KYC documents submitted and verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process KYC' });
  }
};

exports.linkCard = async (req, res) => {
  const { card_number, card_holder, expiry_date, cvv, card_type } = req.body;

  if (!card_number || !card_holder || !expiry_date || !cvv || !card_type) {
    return res.status(400).json({ error: 'All card details are required' });
  }

  try {
    const query = `
      INSERT INTO cards (user_id, card_number, card_holder, expiry_date, cvv, card_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, card_holder, card_type, expiry_date
    `;
    const result = await db.query(query, [req.user.userId, card_number, card_holder, expiry_date, cvv, card_type]);

    res.status(201).json({
      message: 'Card linked successfully',
      card: result.rows[0]
    });
  } catch (error) {
    console.error('Error linking card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.setPin = async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 4) return res.status(400).json({ error: 'PIN must be 4 digits' });

  try {
    await db.query('UPDATE users SET transaction_pin = $1 WHERE id = $2', [pin, req.user.userId]);
    res.status(200).json({ message: 'Transaction PIN set successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set PIN' });
  }
};

exports.toggle2FA = async (req, res) => {
  const { enabled } = req.body;
  try {
    await db.query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [enabled, req.user.userId]);
    res.status(200).json({ message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update 2FA status' });
  }
};
