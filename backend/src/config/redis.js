const redis = require('redis');
require('dotenv').config();

let client;
let useMock = false;
const mockStore = new Map();

if (process.env.USE_MOCK === 'true') {
  useMock = true;
  console.log('Using Mock Redis Store');
} else {
  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => {
    console.error('Redis client connection error. Falling back to Mock Store.');
    useMock = true;
  });

  client.connect().catch(() => {
    console.error('Redis connection failed. Falling back to Mock Store.');
    useMock = true;
  });
}

const mockClient = {
  setEx: async (key, expiry, value) => {
    mockStore.set(key, value);
    setTimeout(() => mockStore.delete(key), expiry * 1000);
    return 'OK';
  },
  get: async (key) => mockStore.get(key),
  del: async (key) => mockStore.delete(key)
};

module.exports = new Proxy({}, {
  get: (target, prop) => {
    if (useMock) return mockClient[prop];
    return client[prop];
  }
});
