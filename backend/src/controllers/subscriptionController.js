const db = require('../config/db');
const { calculateTransactionBreakdown } = require('../utils/financeEngine');

/**
 * Lists all active subscriptions for the user
 */
exports.listSubscriptions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

/**
 * Creates a new recurring subscription (e.g. Netflix, Rent)
 */
exports.createSubscription = async (req, res) => {
  const { name, amount, frequency, nextBillingDate } = req.body;
  if (!name || !amount || !nextBillingDate) return res.status(400).json({ error: 'Subscription details missing' });

  try {
    const query = `
      INSERT INTO subscriptions (user_id, name, amount, frequency, next_billing_date, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;
    const result = await db.query(query, [req.user.userId, name, amount, frequency || 'monthly', nextBillingDate, 'active']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

/**
 * CRON Task Simulator: Process due subscriptions
 */
exports.processDueSubscriptions = async () => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const due = await client.query("SELECT * FROM subscriptions WHERE next_billing_date <= CURRENT_DATE AND status = 'active'");
    
    for (const sub of due.rows) {
      // 1. Calculate fees
      const breakdown = calculateTransactionBreakdown(sub.amount, 'subscription');
      
      // 2. Debit User
      await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [breakdown.total, sub.user_id]);
      
      // 3. Log Transaction & Ledger
      const trans = await client.query(`
        INSERT INTO transactions (sender_id, amount, status, transaction_type, description, tax_amount, fee_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [sub.user_id, sub.amount, 'completed', 'recurring', `Recurring: ${sub.name}`, breakdown.vat, breakdown.serviceFee]);

      // 4. Update Next Billing Date
      await client.query("UPDATE subscriptions SET next_billing_date = next_billing_date + INTERVAL '1 month' WHERE id = $1", [sub.id]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Subscription processing failed:', error);
  } finally {
    client.release();
  }
};
