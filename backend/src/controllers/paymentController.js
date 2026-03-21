const db = require('../config/db');

// MO-BANK Fee Engine: Professional bank fees
const FEES = {
  AIRTIME: 0.50,
  ELECTRICITY: 2.00,
  BILL: 5.00,
  VOUCHER: 1.00
};

exports.payAirtime = async (req, res) => {
  const { phone, amount, pin } = req.body;
  if (!phone || !amount || amount < 10) return res.status(400).json({ error: 'Valid phone and amount (min R10) required' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT balance, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    const totalCost = amount + FEES.AIRTIME;

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < totalCost) return res.status(400).json({ error: 'Insufficient balance (Incl. R0.50 fee)' });

    // Deduct total (Amount + Fee)
    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [totalCost, req.user.userId]);
    
    // Record in Ledger (Double-Entry)
    const transResult = await client.query(`
      INSERT INTO transactions (sender_id, amount, status, transaction_type, description)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [req.user.userId, totalCost, 'completed', 'vas', `Airtime to ${phone} (Fee: R0.50)`]);

    await client.query(`
      INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, balance_after)
      VALUES ($1, $2, $3, $4, $5)
    `, [transResult.rows[0].id, req.user.userId, -totalCost, 'debit', user.balance - totalCost]);

    await client.query('COMMIT');
    res.status(200).json({ 
      message: `R${amount} Airtime successfully sent to ${phone}`,
      fee: FEES.AIRTIME,
      receipt: { type: 'Airtime', recipient: phone, amount, fee: FEES.AIRTIME, date: new Date() }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Airtime purchase failed' });
  } finally {
    client.release();
  }
};

exports.payElectricity = async (req, res) => {
  const { meterNumber, amount, pin } = req.body;
  if (!meterNumber || !amount || amount < 20) return res.status(400).json({ error: 'Valid meter and amount (min R20) required' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT balance, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    const totalCost = amount + FEES.ELECTRICITY;

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < totalCost) return res.status(400).json({ error: 'Insufficient balance (Incl. R2.00 fee)' });

    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [totalCost, req.user.userId]);
    
    const token = Math.floor(Math.random() * 10000000000000000000).toString().replace(/(\d{4})/g, '$1 ').trim();
    
    // Ledger entry
    const transResult = await client.query(`
      INSERT INTO transactions (sender_id, amount, status, transaction_type, description)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [req.user.userId, totalCost, 'completed', 'vas', `Electricity for ${meterNumber} (Fee: R2.00)`]);

    await client.query('COMMIT');
    res.status(200).json({ 
      message: `Electricity token generated successfully`,
      token: token,
      fee: FEES.ELECTRICITY,
      receipt: { type: 'Electricity', meter: meterNumber, amount, fee: FEES.ELECTRICITY, date: new Date() }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Electricity purchase failed' });
  } finally {
    client.release();
  }
};

exports.topUp = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount required' });

  try {
    // In a real app, this would redirect to Stripe/PayStack Checkout
    // Here we simulate the successful payment redirect
    const checkoutUrl = `https://checkout.mo-bank.com/pay?amount=${amount}&uid=${req.user.userId}`;
    
    res.status(200).json({ 
      message: 'Checkout session created',
      url: checkoutUrl,
      sessionId: `mo_cs_${Math.random().toString(36).substr(2, 9)}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate top up' });
  }
};
