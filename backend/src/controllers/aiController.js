const db = require('../config/db');

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Get user context for AI personalization
    const userRes = await db.query('SELECT phone, balance FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];

    // Get recent transactions for context
    const transRes = await db.query('SELECT amount, created_at FROM transactions WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.userId]);
    const recentTransactions = transRes.rows;

    // Mock AI Response Logic
    let aiResponse = "";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('balance')) {
      aiResponse = `Your current MoBank balance is $${user.balance}. Would you like to see a breakdown of your recent spending?`;
    } else if (lowerMsg.includes('spending') || lowerMsg.includes('insight') || lowerMsg.includes('history')) {
      if (recentTransactions.length > 0) {
        const totalSpent = recentTransactions.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        aiResponse = `In your last ${recentTransactions.length} transactions, you've moved a total of $${totalSpent.toFixed(2)}. Most of your activity was on ${new Date(recentTransactions[0].created_at).toLocaleDateString()}. You're managing your funds well!`;
      } else {
        aiResponse = `You haven't made any transactions yet. Start by topping up your balance or linking a card!`;
      }
    } else if (lowerMsg.includes('crypto') || lowerMsg.includes('solana')) {
      aiResponse = `Solana is currently performing well! You can buy SOL directly in the Crypto tab with zero platform fees.`;
    } else if (lowerMsg.includes('transfer') || lowerMsg.includes('send')) {
      aiResponse = `To send money, go to the 'Transfer' tab. All P2P transfers are instant and secured by our AI fraud detection.`;
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      aiResponse = `Hello! I am Mo, your AI Banking Assistant. How can I help you manage your finances today?`;
    } else {
      aiResponse = `I'm Mo, your AI assistant. I can help you check your balance, manage your crypto, or explain our security features. What's on your mind?`;
    }

    res.status(200).json({
      reply: aiResponse,
      sender: 'Mo (AI)'
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'AI Assistant is currently offline' });
  }
};
