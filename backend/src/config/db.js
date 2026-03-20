const { Pool } = require('pg');
require('dotenv').config();

let pool;
let useMock = false;

// Mock data store
const mockDB = {
  users: [{ 
    id: 1, 
    phone: '+27123456789', 
    balance: 15000.00,
    solana_address: 'GvT...6Yf', 
    solana_private_key: '...',
    transaction_pin: null,
    two_factor_enabled: false,
    kyc_status: 'pending', // 'pending', 'verified', 'rejected'
    kyc_documents: [],
    announcements: [
      { id: 1, title: 'Welcome to MoBank', content: 'Experience the future of digital banking today.', date: '2024-03-20' },
      { id: 2, title: 'Security Update', content: 'New 2FA features are now available in your profile settings.', date: '2024-03-21' }
    ],
    updates: [
      { id: 1, version: 'v1.2.0', note: 'AI Assistant integration and Solana wallet support.' }
    ]
  }],
  cards: [
    { id: 1, user_id: 1, card_number: '1234567891011121', card_holder: 'MoBank User', expiry_date: '12/28', card_type: 'Visa' },
    { id: 2, user_id: 1, card_number: '9876543210987654', card_holder: 'MoBank User', expiry_date: '06/27', card_type: 'MasterCard' }
  ],
  transactions: []
};

if (process.env.USE_MOCK === 'true') {
  useMock = true;
  console.log('Using Mock Database');
} else {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mobank',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  pool.on('error', (err) => {
    console.error('Database error. Falling back to Mock DB.');
    useMock = true;
  });

  pool.connect().catch(() => {
    console.error('Database connection failed. Falling back to Mock DB.');
    useMock = true;
  });
}

const mockQuery = async (text, params) => {
  // Simple mock query logic for basic demo
  if (text.includes('SELECT * FROM users WHERE phone = $1')) {
    const user = mockDB.users.find(u => u.phone === params[0]);
    return { rows: user ? [user] : [] };
  }
  if (text.includes('INSERT INTO users')) {
    const newUser = { id: mockDB.users.length + 1, phone: params[0], balance: params[1] || 0 };
    mockDB.users.push(newUser);
    return { rows: [newUser] };
  }
  if (text.includes('SELECT id, phone, balance FROM users WHERE id = $1')) {
    const user = mockDB.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [] };
  }
  if (text.includes('SELECT solana_address, solana_private_key FROM users WHERE id = $1')) {
    const user = mockDB.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [] };
  }
  if (text.includes('UPDATE users SET solana_address = $1, solana_private_key = $2 WHERE id = $3')) {
    const user = mockDB.users.find(u => u.id === params[2]);
    if (user) {
      user.solana_address = params[0];
      user.solana_private_key = params[1];
    }
    return { rows: [] };
  }
  if (text.includes('SELECT id, card_number, card_holder, expiry_date, card_type FROM cards WHERE user_id = $1')) {
    const cards = mockDB.cards.filter(c => c.user_id === params[0]);
    return { rows: cards };
  }
  if (text.includes('UPDATE users SET balance = balance - $1 WHERE id = $2')) {
    const user = mockDB.users.find(u => u.id === params[1]);
    if (user) user.balance -= params[0];
    return { rows: [] };
  }
  return { rows: [] };
};

module.exports = {
  query: async (text, params) => {
    if (useMock) return mockQuery(text, params);
    return pool.query(text, params);
  },
  pool: new Proxy({}, {
    get: (target, prop) => {
      if (useMock) return { 
        connect: async () => ({ 
          query: mockQuery, 
          release: () => {}, 
          on: () => {} 
        }) 
      };
      return pool[prop];
    }
  })
};
