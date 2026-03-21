const db = require('../config/db');
const { detectFraudRisk, calculateTransactionBreakdown } = require('../utils/financeEngine');

exports.transfer = async (req, res, io) => {
  const { receiverPhone, amount, description, pin, location = 'RSA' } = req.body;

  if (!receiverPhone || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer details' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Verify PIN and Fetch sender
    const senderRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [req.user.userId]);
    const sender = senderRes.rows[0];

    if (sender.transaction_pin !== pin) {
      throw new Error('Invalid transaction PIN');
    }

    // MoAI FRAUD DETECTION
    const fraudResult = detectFraudRisk(sender, amount, location);
    if (fraudResult.isFlagged) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        error: 'Transaction flagged for security review',
        code: 'FRAUD_BLOCK',
        moai_reason: 'High velocity / unusual pattern detected'
      });
    }

    // Financial Breakdown (Tax + Fees)
    const breakdown = calculateTransactionBreakdown(amount, 'p2p');
    const totalDeduction = breakdown.total;

    if (sender.balance < totalDeduction) {
      throw new Error(`Insufficient balance (Incl. VAT: R${breakdown.vat} & Service Fee: R${breakdown.serviceFee})`);
    }

    // Check receiver
    const receiverRes = await client.query('SELECT id, balance FROM users WHERE phone = $1 FOR UPDATE', [receiverPhone]);
    if (receiverRes.rows.length === 0) {
      throw new Error('Receiver not found');
    }
    const receiver = receiverRes.rows[0];

    if (sender.id === receiver.id) {
      throw new Error('Cannot transfer to yourself');
    }

    // Perform transfer
    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [totalDeduction, sender.id]);
    await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, receiver.id]);

    // Record transaction
    const transQuery = `
      INSERT INTO transactions (sender_id, receiver_id, amount, status, transaction_type, description, tax_amount, fee_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const transResult = await client.query(transQuery, [
      sender.id, 
      receiver.id, 
      amount, 
      'completed', 
      'p2p', 
      description,
      breakdown.vat,
      breakdown.serviceFee
    ]);
    const transactionId = transResult.rows[0].id;

    // Double-Entry Ledger Implementation
    // 1. Debit Sender
    await client.query(`
      INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, balance_after)
      VALUES ($1, $2, $3, $4, $5)
    `, [transactionId, sender.id, -totalDeduction, 'debit', sender.balance - totalDeduction]);

    // 2. Credit Receiver
    await client.query(`
      INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, balance_after)
      VALUES ($1, $2, $3, $4, $5)
    `, [transactionId, receiver.id, amount, 'credit', receiver.balance + amount]);

    await client.query('COMMIT');

    // Emit real-time notifications
    io.to(`user_${receiver.id}`).emit('new_transaction', {
      type: 'receive',
      amount,
      sender: req.user.phone,
      description
    });

    res.status(200).json({
      message: 'Transfer successful',
      transaction: transResult.rows[0],
      breakdown
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', error);
    res.status(400).json({ error: error.message || 'Internal server error' });
exports.refund = async (req, res) => {
  const { transactionId, reason } = req.body;
  if (!transactionId) return res.status(400).json({ error: 'Transaction ID required' });

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Fetch the original transaction
    const transRes = await client.query('SELECT * FROM transactions WHERE id = $1 AND sender_id = $2', [transactionId, req.user.userId]);
    if (transRes.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    const original = transRes.rows[0];

    if (original.status === 'refunded') return res.status(400).json({ error: 'Already refunded' });

    // 2. Calculate refund (using Finance Engine)
    const { calculateReversal } = require('../utils/financeEngine');
    const { totalRefund } = calculateReversal(original);

    // 3. Update User Balance
    await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [totalRefund, req.user.userId]);

    // 4. Update Original Transaction Status
    await client.query('UPDATE transactions SET status = $1, description = $2 WHERE id = $3', 
      ['refunded', `${original.description} (Refunded: ${reason})`, transactionId]);

    // 5. Add Ledger Entry for Audit
    await client.query(`
      INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, balance_after)
      VALUES ($1, $2, $3, $4, (SELECT balance FROM users WHERE id = $2))
    `, [transactionId, req.user.userId, totalRefund, 'credit']);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Refund processed successfully', amount: totalRefund });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Refund failed' });
  } finally {
    client.release();
  }
};

exports.getHistory = async (req, res) => {
  try {
    const query = `
      SELECT t.*, 
             s.phone as sender_phone, 
             r.phone as receiver_phone
      FROM transactions t
      JOIN users s ON t.sender_id = s.id
      JOIN users r ON t.receiver_id = r.id
      WHERE t.sender_id = $1 OR t.receiver_id = $1
      ORDER BY t.created_at DESC
    `;
    const result = await db.query(query, [req.user.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
