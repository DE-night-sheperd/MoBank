/**
 * Mo-Bank Advanced Financial Logic Engine
 * Handles Tax (VAT), Currency Exchange, Fraud Scoring, and Recurring Logic
 */

const VAT_RATE = 0.15; // 15% South African VAT
const EXCHANGE_RATES = {
  ZAR: 1.0,
  USD: 0.052, // 1 USD = 19.23 ZAR (approx)
  EUR: 0.048,
  GBP: 0.041
};

/**
 * Calculates Tax and Fees for a transaction
 */
const calculateTransactionBreakdown = (amount, type) => {
  const vat = amount * VAT_RATE;
  let serviceFee = 0;

  switch (type) {
    case 'vas': serviceFee = 2.50; break;
    case 'international': serviceFee = amount * 0.025; break; // 2.5% FX fee
    case 'p2p': serviceFee = 0; break;
    default: serviceFee = 1.00;
  }

  return {
    subtotal: amount,
    vat: parseFloat(vat.toFixed(2)),
    serviceFee: parseFloat(serviceFee.toFixed(2)),
    total: parseFloat((amount + vat + serviceFee).toFixed(2))
  };
};

/**
 * MoAI Fraud Detection Engine
 * Returns a risk score (0-100)
 */
const detectFraudRisk = (user, amount, location) => {
  let riskScore = 0;
  
  // Velocity check: Is the amount unusually high?
  if (amount > 10000) riskScore += 30;
  if (amount > 50000) riskScore += 60;

  // Consistency check: Is the location new?
  if (user.lastLocation && user.lastLocation !== location) {
    riskScore += 25;
  }

  return {
    score: riskScore,
    isFlagged: riskScore >= 75,
    action: riskScore >= 75 ? 'BLOCK' : riskScore >= 50 ? 'REVIEW' : 'ALLOW'
  };
};

/**
 * Currency Converter
 */
const convertCurrency = (amount, from, to) => {
  const zarAmount = amount / EXCHANGE_RATES[from];
  return parseFloat((zarAmount * EXCHANGE_RATES[to]).toFixed(2));
};

/**
 * Processes a transaction reversal (Refund) logic
 */
const calculateReversal = (transaction) => {
  // Banks usually refund the subtotal but might keep the service fee
  // depending on why the transaction failed.
  return {
    refundAmount: transaction.amount,
    reclaimTax: transaction.tax_amount,
    totalRefund: transaction.amount + transaction.tax_amount
  };
};

/**
 * Subscription Logic Engine
 */
const SUBSCRIPTION_PLANS = {
  NETFLIX: { amount: 199, day: 1 },
  SPOTIFY: { amount: 59, day: 15 },
  MO_PRIME: { amount: 99, day: 25 }
};

module.exports = {
  calculateTransactionBreakdown,
  detectFraudRisk,
  convertCurrency,
  calculateReversal,
  SUBSCRIPTION_PLANS,
  EXCHANGE_RATES
};
