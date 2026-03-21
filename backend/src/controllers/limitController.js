const db = require('../config/db');

exports.getLimits = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM user_limits WHERE user_id = $1', [req.user.userId]);
    res.status(200).json(result.rows[0] || { daily_transfer: 5000, monthly_transfer: 50000 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch limits' });
  }
};

exports.updateLimits = async (req, res) => {
  const { daily_transfer, monthly_transfer } = req.body;
  try {
    const query = `
      INSERT INTO user_limits (user_id, daily_transfer, monthly_transfer)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE 
      SET daily_transfer = EXCLUDED.daily_transfer, monthly_transfer = EXCLUDED.monthly_transfer
      RETURNING *
    `;
    const result = await db.query(query, [req.user.userId, daily_transfer, monthly_transfer]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update limits' });
  }
};
