const db = require('../config/db');

exports.payAirtime = async (req, res) => {
  const { phone, amount, pin } = req.body;
  if (!phone || !amount || amount < 10) return res.status(400).json({ error: 'Valid phone and amount (min R10) required' });

  try {
    const userRes = await db.query('SELECT balance, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.user.userId]);
    
    // In a real app, you'd call a VAS provider API here
    res.status(200).json({ 
      message: `R${amount} Airtime successfully sent to ${phone}`,
      receipt: { type: 'Airtime', recipient: phone, amount, date: new Date() }
    });
  } catch (error) {
    res.status(500).json({ error: 'Airtime purchase failed' });
  }
};

exports.payElectricity = async (req, res) => {
  const { meterNumber, amount, pin } = req.body;
  if (!meterNumber || !amount || amount < 20) return res.status(400).json({ error: 'Valid meter and amount (min R20) required' });

  try {
    const userRes = await db.query('SELECT balance, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.user.userId]);
    
    const token = Math.floor(Math.random() * 10000000000000000000).toString().replace(/(\d{4})/g, '$1 ').trim();
    
    res.status(200).json({ 
      message: `Electricity token generated successfully`,
      token: token,
      receipt: { type: 'Electricity', meter: meterNumber, amount, date: new Date() }
    });
  } catch (error) {
    res.status(500).json({ error: 'Electricity purchase failed' });
  }
};

exports.payBill = async (req, res) => {
  const { biller, accountReference, amount, pin } = req.body;
  if (!biller || !accountReference || !amount) return res.status(400).json({ error: 'All bill details are required' });

  try {
    const userRes = await db.query('SELECT balance, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.user.userId]);
    
    res.status(200).json({ 
      message: `Payment of R${amount} to ${biller} successful`,
      receipt: { type: 'Bill', biller, reference: accountReference, amount, date: new Date() }
    });
  } catch (error) {
    res.status(500).json({ error: 'Bill payment failed' });
  }
};

exports.buyVoucher = async (req, res) => {
  const { voucherType, amount, pin } = req.body;
  if (!voucherType || !amount) return res.status(400).json({ error: 'Voucher type and amount required' });

  try {
    const userRes = await db.query('SELECT balance, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.user.userId]);
    
    const code = Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + 
                 Math.random().toString(36).substr(2, 4).toUpperCase() + '-' +
                 Math.random().toString(36).substr(2, 4).toUpperCase();

    res.status(200).json({ 
      message: `${voucherType} voucher purchased!`,
      token: code,
      receipt: { type: 'Voucher', brand: voucherType, amount, date: new Date() }
    });
  } catch (error) {
    res.status(500).json({ error: 'Voucher purchase failed' });
  }
};
