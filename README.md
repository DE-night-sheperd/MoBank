# MoBank - Mobile Banking System 🚀

MoBank is a modern, secure, and real-time mobile banking system designed for a seamless financial experience.

## 🌟 Features

- ✅ **Phone-based Auth**: Registration & authentication via phone number with OTP verification (WhatsApp/SMS).
- ✅ **Card Management**: Link multiple Debit/Credit cards securely.
- ✅ **Real-time P2P**: Instant peer-to-peer money transfers with live notifications.
- ✅ **Trading**: Integrated capabilities for stocks and crypto trading.
- ✅ **Analytics**: Comprehensive transaction history and financial analytics.
- ✅ **Security**: End-to-end encryption, PCI-DSS compliance, and secure session management.

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js**: High-performance REST API server.
- **PostgreSQL**: Secure relational database for transactions and card data.
- **Redis**: Caching and session management for real-time operations.
- **Socket.io**: Real-time notifications for P2P transactions.
- **JWT**: Secure token-based authentication.
- **Twilio/WhatsApp API**: Integrated for OTP delivery.

### Frontend
- **React.js**: Modern, responsive web-based dashboard.
- **Vite**: Ultra-fast build tool for the frontend.
- **Axios**: Promise-based HTTP client for API requests.

### Infrastructure
- **Docker**: Containerization for easy deployment.
- **GitHub Actions**: CI/CD pipelines for automated testing and deployment.
- **Jest**: Comprehensive testing framework.

## 📂 Project Structure

```text
MOBANK/
├── backend/            # Express.js API
│   ├── src/
│   │   ├── config/     # DB & Redis configs
│   │   ├── controllers/# Business logic
│   │   ├── models/     # SQL schema & data models
│   │   ├── routes/     # API endpoints
│   │   └── index.js    # Entry point
│   ├── Dockerfile
│   └── .env            # Environment variables
├── frontend/           # React Dashboard
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Dashboard pages
│   │   └── App.jsx     # Main entry
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml  # Infrastructure setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL & Redis (if running locally without Docker)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DE-night-sheperd/MoBank.git
   cd MoBank
   ```

2. **Run with Docker (Recommended)**:
   ```bash
   docker compose up --build
   ```

3. **Run Locally**:
   - **Backend**:
     ```bash
     cd backend
     npm install
     npm run dev
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:
```plaintext
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mobank
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_phone
```

## 📜 API Documentation

- **Auth**:
  - `POST /api/auth/request-otp`: Request OTP for login/registration.
  - `POST /api/auth/verify-otp`: Verify OTP and get JWT token.
- **User**:
  - `GET /api/users/me`: Get current user details.
- **Transactions**:
  - `POST /api/transactions/transfer`: P2P money transfer.
  - `GET /api/transactions/history`: Transaction history.

## 🤝 Contributing
Contributions are welcome! Please read the contributing guidelines before submitting a PR.
