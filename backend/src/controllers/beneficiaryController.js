const db = require('../config/db');

exports.listBeneficiaries = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM beneficiaries WHERE user_id = $1 ORDER BY name ASC', [req.user.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch beneficiaries' });
  }
};

exports.addBeneficiary = async (req, res) => {
  const { name, phone, bank_name } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  try {
    const query = `
      INSERT INTO beneficiaries (user_id, name, phone, bank_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [req.user.userId, name, phone, bank_name || 'MoBank']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add beneficiary' });
  }
};

exports.deleteBeneficiary = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    res.status(200).json({ message: 'Beneficiary removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove beneficiary' });
  }
};
