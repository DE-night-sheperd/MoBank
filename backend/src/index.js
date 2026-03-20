require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/api/socket.io',
  cors: {
    origin: ["https://mobank-inky.vercel.app", "http://localhost:3000", "http://localhost:3001"],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: ["https://mobank-inky.vercel.app", "https://mobank-5u9110aqo-de-night-sheperds-projects.vercel.app", "http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes(io));
app.use('/api/crypto', cryptoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is reachable at /api/test' });
});

app.get('/', (req, res) => {
  res.json({ message: 'MoBank API is running' });
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
