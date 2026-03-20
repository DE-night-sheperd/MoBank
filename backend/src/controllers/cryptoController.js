const db = require('../config/db');
const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

// Connect to Solana Devnet for testing (Mainnet for production)
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

exports.getPrices = async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=zar');
    res.status(200).json(response.data);
  } catch (error) {
    // Fallback if API fails (using rough ZAR estimates: $1 = R18.50)
    res.status(200).json({
      solana: { zar: 2700.50 },
      bitcoin: { zar: 1150000.00 },
      ethereum: { zar: 63000.00 }
    });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const result = await db.query('SELECT solana_address, solana_private_key FROM users WHERE id = $1', [req.user.userId]);
    let { solana_address, solana_private_key } = result.rows[0] || {};

    if (!solana_address) {
      // Create new Solana wallet if user doesn't have one
      const keypair = Keypair.generate();
      solana_address = keypair.publicKey.toString();
      solana_private_key = Buffer.from(keypair.secretKey).toString('base64');

      await db.query('UPDATE users SET solana_address = $1, solana_private_key = $2 WHERE id = $3', [solana_address, solana_private_key, req.user.userId]);
    }

    // Get live balance from blockchain
    let balance = 0;
    try {
      const pubKey = new PublicKey(solana_address);
      balance = await connection.getBalance(pubKey);
      balance = balance / LAMPORTS_PER_SOL;
    } catch (e) {
      console.error('Solana balance fetch failed, using 0');
    }

    res.status(200).json({
      address: solana_address,
      balance: balance,
      network: 'Devnet (Solana)'
    });
  } catch (error) {
    console.error('Crypto wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch crypto wallet' });
  }
};

exports.buyCrypto = async (req, res) => {
  const { amountUSD, pin } = req.body; // How much fiat to convert to SOL
  if (!amountUSD || amountUSD <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    const userRes = await db.query('SELECT balance, solana_address, transaction_pin FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    if (user.transaction_pin !== pin) return res.status(403).json({ error: 'Invalid transaction PIN' });
    if (user.balance < amountUSD) return res.status(400).json({ error: 'Insufficient fiat balance' });

    // 1. Deduct fiat
    await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amountUSD, req.user.userId]);

    // 2. Mock: In a real app, you'd use a provider like MoonPay/Stripe or send from a treasury wallet
    // For demo: we'll simulate the "Onramp" by logging it. 
    // In devnet, we could actually airdrop some SOL if balance is 0.
    
    res.status(200).json({
      message: `Successfully onramped $${amountUSD} to Solana`,
      txid: 'MOCK_TX_' + Math.random().toString(36).substring(7)
    });
  } catch (error) {
    console.error('Onramp error:', error);
    res.status(500).json({ error: 'Onramp failed' });
  }
};
