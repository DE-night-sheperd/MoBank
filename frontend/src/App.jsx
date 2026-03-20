import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Wallet, CreditCard, Send, History, User, LogOut, Plus, ChevronRight, Coins, TrendingUp, ShieldCheck, PieChart, MessageCircle, SendHorizonal, Bot, FileText, Bell, Info, Shield, ArrowRight, ExternalLink, Smartphone, Zap, Receipt, Ticket, Target, Scan } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Pie, Pie as RePie, PieChart as RePieChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = ''; // Same-origin proxying in production

axios.defaults.baseURL = BACKEND_URL;

const socket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:5001', {
  path: '/api/socket.io',
  transports: ['polling', 'websocket'], // Prefer polling first for serverless
  reconnection: true
});

const getTimeRemaining = (deadline) => {
  const total = Date.parse(deadline) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
};

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(deadline);
      setTimeLeft(remaining);
      if (remaining.total <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.total <= 0) return <span>Penalty Due!</span>;

  return (
    <span>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
};

function App() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [history, setHistory] = useState([]);
  const [cryptoWallet, setCryptoWallet] = useState(null);
  const [prices, setPrices] = useState({ solana: { zar: 0 }, bitcoin: { zar: 0 }, ethereum: { zar: 0 } });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activePortfolioTab, setActivePortfolioTab] = useState('banking');
  const [transferData, setTransferData] = useState({ phone: '', amount: '', description: '' });
  const [cardForm, setCardForm] = useState({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa' });
  const [buyAmount, setBuyAmount] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ text: "Hi! I'm Mo, your AI Assistant. How can I help you today?", sender: 'ai' }]);
  const [chatInput, setChatInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinAction, setPinAction] = useState(null); // 'transfer', 'buy', 'payment'
  const [newPin, setNewPin] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [kycForm, setKycForm] = useState({ docType: 'ID', docNumber: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [paymentType, setPaymentType] = useState('airtime'); // 'airtime', 'electricity', 'bill', 'vouchers', 'insurance', 'payshap'
  const [paymentForm, setPaymentForm] = useState({ 
    phone: '', 
    meterNumber: '', 
    biller: 'Eskom', 
    accountReference: '', 
    amount: '', 
    voucherType: 'Netflix',
    insuranceType: '',
    insurancePlan: '',
    shapID: ''
  });
  const [savingsGoals, setSavingsGoals] = useState([
    { 
      id: 1, 
      name: 'New Car', 
      target: 250000, 
      current: 45000, 
      icon: '🚗', 
      targetDate: '2026-12-31', 
      isLocked: true,
      hasWithdrawnEarly: false,
      repaymentDeadline: null,
      unpaidWithdrawal: 0 
    },
    { 
      id: 2, 
      name: 'Holiday Fund', 
      target: 15000, 
      current: 8500, 
      icon: '✈️', 
      targetDate: '2026-06-15', 
      isLocked: true,
      hasWithdrawnEarly: false,
      repaymentDeadline: null,
      unpaidWithdrawal: 0 
    }
  ]);
  const [newGoalForm, setNewGoalForm] = useState({ name: '', target: '', date: '', icon: '💰' });
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'limits', 'notifications', 'beneficiaries', 'rewards', 'google-wallet', 'create-savings'
  const [moLimits, setMoLimits] = useState({ dailyTransfer: 50000, atmWithdrawal: 5000, onlinePurchase: 20000 });
  const [moAccounts, setMoAccounts] = useState([
    { 
      id: 101, 
      name: 'Capitec Bank', 
      type: 'Everyday Savings', 
      number: '14635941870', 
      balance: 12500.50, 
      theme: 'capitec',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Capitec_Bank_logo.svg/1200px-Capitec_Bank_logo.svg.png'
    },
    { 
      id: 102, 
      name: 'First National Bank', 
      type: 'Gold Fusion', 
      number: '62749501833', 
      balance: 45200.00, 
      theme: 'fnb',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/First_National_Bank_Logo.svg/1200px-First_National_Bank_Logo.svg.png'
    },
    { 
      id: 103, 
      name: 'Discovery Bank', 
      type: 'Vitality Savings', 
      number: '91028374655', 
      balance: 8500.25, 
      theme: 'discovery',
      logo: 'https://www.discovery.co.za/discovery_coza/assets/images/discovery-bank-logo.png',
      isBestForRewards: true
    }
  ]);
  const [googleWalletStatus, setGoogleWalletStatus] = useState('not_added'); // 'not_added', 'adding', 'added'
  const [moPulse, setMoPulse] = useState({
    score: 450,
    rings: { exercise: 85, finance: 60, social: 40 },
    vouchers: [
      { id: 1, brand: 'Checkers', amount: 50, code: 'CHK-9921-MO', claimed: false },
      { id: 2, brand: 'Vida e Caffe', amount: 35, code: 'VIDA-FREE-MO', claimed: false }
    ],
    unlocked: ['Priority Support', 'Virtual Card Pro', 'Lower Crypto Fees']
  });

  const [selectedCardTier, setSelectedCardTier] = useState(0);

  const cardTiers = [
    { 
      name: 'MoGreen (Crypto Pro)', 
      img: '/card_green.png',
      benefits: ['Seamless Crypto', 'Lowest Gas Fees', 'Instant P2P', 'Direct Trading'],
      theme: 'mint'
    },
    { 
      name: 'MoBlack (Elite)', 
      img: '/card_black.png',
      benefits: ['Elite Status', 'Global Concierge', 'Crypto & P2P Elite', 'Highest Limits'],
      theme: 'indigo'
    },
    { 
      name: 'MoBlue (Standard)', 
      img: '/card_blue.png',
      benefits: ['Fast & Reliable', 'Secure Banking', 'Seamless P2P', 'Free MoSend'],
      theme: 'blue'
    },
    { 
      name: 'MoGold (Premium)', 
      img: '/card_gold.png',
      benefits: ['Premium Tier', 'Gold Status', 'Unlimited Crypto', 'VIP MoSupport'],
      theme: 'gold'
    },
    { 
      name: 'MoCyber (Elite)', 
      img: '/card_cyber.png',
      benefits: ['Elite Tier', 'Futuristic Design', 'Lowest Gas Fees', 'Web3 Native'],
      theme: 'cyber'
    },
    { 
      name: 'MoNavy (Reliable)', 
      img: '/card_navy.png',
      benefits: ['Reliable Tier', 'Fast P2P', 'Direct Trading', 'Daily Cashback'],
      theme: 'navy'
    },
    { 
      name: 'MoGreen (Elite Vertical)', 
      img: '/card_green_elite.png',
      benefits: ['Elite Status', 'Vertical Stealth', 'Lowest Gas Fees', 'MoMonthly Excellent'],
      theme: 'mint-dark'
    },
    { 
      name: 'MoWhite (Basic)', 
      img: '/card_white.png',
      benefits: ['Basic Tier', 'No Monthly Fees', 'Simple Banking', 'MoBank Standard'],
      theme: 'white'
    },
    { 
      name: 'MoSilver (Premium)', 
      img: '/card_silver.png',
      benefits: ['Silver Tier', 'Enhanced Limits', 'Priority Support', 'Cashback Rewards'],
      theme: 'silver'
    }
  ];

  const [selectedAccountId, setSelectedAccountId] = useState(101); // Default to first account

  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setSelectedCardTier((prev) => (prev + 1) % cardTiers.length);
      }, 3000); // Rotate cards every 3 seconds on the landing page
      return () => clearInterval(interval);
    }
  }, [user, cardTiers.length]);

  const totalBalance = moAccounts.reduce((acc, curr) => acc + curr.balance, user?.balance || 0);

  const getAutoTier = (balance) => {
    if (balance <= 10000) return 7; // MoWhite (Basic)
    if (balance <= 25000) return 2; // MoBlue (Standard)
    if (balance <= 50000) return 8; // MoSilver (Premium)
    if (balance <= 100000) return 3; // MoGold (Premium)
    if (balance <= 250000) return 5; // MoNavy (Reliable)
    if (balance <= 500000) return 6; // MoGreen (Elite Vertical)
    if (balance <= 1000000) return 4; // MoCyber (Elite)
    return 1; // MoBlack (Elite)
  };

  useEffect(() => {
    if (user) {
      setSelectedCardTier(getAutoTier(totalBalance));
    }
  }, [totalBalance, user]);

  const getCreditScore = (balance) => {
    // Mock credit score logic based on unified balance
    const base = 600;
    const added = Math.min(250, Math.floor(balance / 5000));
    return base + added;
  };

  const creditScore = getCreditScore(totalBalance);
  const creditStatus = creditScore >= 750 ? 'Excellent' : creditScore >= 680 ? 'Good' : 'Fair';
  const creditClass = creditStatus.toLowerCase();

  const getBestAccount = (type) => {
    if (type === 'vouchers' || type === 'airtime') return 103; // Discovery for rewards
    return 102; // FNB for low fees/high balance
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetchCards(token);
      fetchHistory(token);
      fetchCryptoWallet();
      fetchPrices();
      fetchAnnouncements();

      socket.on('balanceUpdate', (newBalance) => {
        setUser(prev => ({ ...prev, balance: newBalance }));
      });

      return () => socket.off('balanceUpdate');
    }
  }, [user]);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const fetchCards = async (token) => {
    try {
      const response = await axios.get('/api/users/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(response.data);
    } catch (error) {}
  };

  const fetchHistory = async (token) => {
    try {
      const response = await axios.get('/api/transactions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {}
  };

  const fetchAnnouncements = async () => {
    setAnnouncements([
      { id: 1, title: 'Crypto Onramp Live!', content: 'You can now buy Solana instantly with your Rand balance.', date: '2026-03-10' },
      { id: 2, title: 'Security Update', content: 'We have enhanced our 2FA system for your protection.', date: '2026-03-05' }
    ]);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      console.log('Requesting OTP for:', phone);
      const response = await axios.post('/api/auth/request-otp', { phone });
      console.log('OTP Response:', response.data);
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      console.error('OTP Request Error:', error.response || error);
      setMessage(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      console.log('Verifying OTP:', otp, 'for:', phone);
      const response = await axios.post('/api/auth/verify-otp', { phone, otp });
      console.log('Verify Response:', response.data);
      setIsScanning(true);
      
      // Super Financial System: Auto-Discovery based on Mobile/ID
      setTimeout(() => {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        setIsScanning(false);
      }, 3000);
      
    } catch (error) {
      console.error('Verify Error:', error.response || error);
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  const handleDelinkAccount = (id) => {
    if (window.confirm("Delink this bank account? You can re-discover it using your MoID anytime.")) {
      setMoAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  const handleLinkMore = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("MoAI scan complete. No new linked accounts found for this ID/Mobile.");
    }, 2000);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!user.pin_set) {
      alert('Please set a transaction PIN in Profile first');
      return;
    }
    setPinAction('transfer');
    setShowPinModal(true);
  };

  const executeTransfer = async (pin) => {
    try {
      await axios.post('/api/transactions/transfer', {
        receiverPhone: transferData.phone,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
        pin: pin
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Transfer Successful!');
      setTransferData({ phone: '', amount: '', description: '' });
      fetchProfile(localStorage.getItem('token'));
      setActiveTab('dashboard');
      setShowPinModal(false);
      setPinInput('');
    } catch (error) {
      alert(error.response?.data?.error || 'Transfer failed');
      setPinInput('');
    }
  };

  const handleBuyCrypto = (e) => {
    e.preventDefault();
    if (!user.pin_set) {
      alert('Please set a transaction PIN in Profile first');
      return;
    }
    setPinAction('buy');
    setShowPinModal(true);
  };

  const executeBuyCrypto = async (pin) => {
    try {
      await axios.post('/api/crypto/buy', { 
        amountUSD: parseFloat(buyAmount),
        pin: pin
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(`Onramp Success! R${buyAmount} converted to SOL`);
      setBuyAmount('');
      fetchProfile(localStorage.getItem('token'));
      fetchCryptoWallet();
      setShowPinModal(false);
      setPinInput('');
    } catch (error) {
      alert(error.response?.data?.error || 'Onramp failed');
      setPinInput('');
    }
  };

  const fetchCryptoWallet = async () => {
    try {
      const response = await axios.get('/api/crypto/wallet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCryptoWallet(response.data);
    } catch (error) {
      console.error('Wallet fetch failed:', error);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await axios.get('/api/crypto/prices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPrices(response.data);
    } catch (error) {
      console.error('Price fetch failed:', error);
    }
  };

  const handleLinkCard = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/link-card', {
        card_number: cardForm.number,
        card_holder: cardForm.holder,
        expiry_date: cardForm.expiry,
        cvv: cardForm.cvv,
        card_type: cardForm.type
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Card Linked!');
      setCardForm({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa' });
      fetchProfile(localStorage.getItem('token'));
      setActiveTab('dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'Linking failed');
    }
  };

  const createVirtualCard = async () => {
    try {
      const virtualCard = {
        card_number: `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
        card_holder: 'MoBank Virtual',
        expiry_date: '03/29',
        card_type: 'Visa',
        cvv: '999'
      };
      
      await axios.post('/api/users/link-card', virtualCard, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      alert('Instant Virtual Card Created!');
      fetchProfile(localStorage.getItem('token'));
    } catch (error) {
      alert('Virtual card creation failed');
    }
  };

  const handleTopUp = async () => {
    if (cards.length === 0) {
      alert("No linked cards found. Please link a card in the Profile tab first.");
      setActiveTab('more');
      setActiveTab('profile'); // Switching to profile tab to link card
      return;
    }

    const selectedCard = cards[0]; 
    const amount = prompt(`Top up using ${selectedCard.card_type} (**** ${selectedCard.card_number.slice(-4)})\nEnter amount (Min R100):`, '500');
    
    if (!amount || isNaN(amount) || amount < 100) return;

    try {
      const response = await axios.post('/api/users/top-up', { 
        amount: parseFloat(amount),
        cardId: selectedCard.id 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert(`Success! R${amount} loaded from your ${selectedCard.card_type} card.`);
        fetchProfile(localStorage.getItem('token'));
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Top-up failed');
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...chatMessages, { text: chatInput, sender: 'user' }];
    setChatMessages(newMsgs);
    setChatInput('');

    try {
      const response = await axios.post('/api/ai/chat', { message: chatInput }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChatMessages([...newMsgs, { text: response.data.reply, sender: 'ai' }]);
    } catch (error) {
      setChatMessages([...newMsgs, { text: "Sorry, I'm having trouble thinking right now.", sender: 'ai' }]);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (newPin.length !== 4) return alert('PIN must be 4 digits');
    try {
      await axios.post('/api/users/set-pin', { pin: newPin }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('PIN saved successfully!');
      setNewPin('');
      fetchProfile(localStorage.getItem('token'));
    } catch (error) {
      alert('Failed to save PIN');
    }
  };

  const handleToggle2FA = async (enabled) => {
    try {
      await axios.post('/api/users/toggle-2fa', { enabled }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchProfile(localStorage.getItem('token'));
    } catch (error) {
      alert('Failed to update 2FA status');
    }
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    
    setTimeout(async () => {
      try {
        await axios.post('/api/users/kyc', kycForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsScanning(false);
        alert('KYC Documents verified by Mo AI!');
        fetchProfile(localStorage.getItem('token'));
      } catch (error) {
        setIsScanning(false);
        alert('KYC submission failed');
      }
    }, 3000);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!user.pin_set) {
      alert('Please set a transaction PIN in Profile first');
      return;
    }
    setPinAction('payment');
    setShowPinModal(true);
  };

  const executePayment = async (pin) => {
    try {
      const endpoint = `/api/payments/${paymentType === 'vouchers' ? 'voucher' : paymentType}`;
      const response = await axios.post(endpoint, { ...paymentForm, pin }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setReceiptData({ ...response.data.receipt, token: response.data.token });
      setShowReceipt(true);
      fetchProfile(localStorage.getItem('token'));
      fetchHistory(localStorage.getItem('token'));
      setShowPinModal(false);
      setPinInput('');
      setPaymentForm({ phone: '', meterNumber: '', biller: 'Eskom', accountReference: '', amount: '', voucherType: 'Netflix' });
    } catch (error) {
      alert(error.response?.data?.error || 'Payment failed');
      setPinInput('');
    }
  };

  const handleAddAccount = () => {
    const name = prompt("Enter MoAccount Name (e.g. Holiday Fund, Car Savings):");
    if (!name) return;
    
    const newAcc = {
      id: Date.now(),
      name: name,
      number: Math.floor(1000000000 + Math.random() * 9000000000),
      balance: 0,
      type: 'Savings'
    };
    setMoAccounts(prev => [...prev, newAcc]);
    alert(`${name} created successfully!`);
  };

  const handleUpdateLimit = (type, value) => {
    setMoLimits(prev => ({ ...prev, [type]: value }));
  };

  const handleGoogleWallet = () => {
    if (googleWalletStatus === 'added') return;
    setGoogleWalletStatus('adding');
    setTimeout(() => {
      setGoogleWalletStatus('added');
      alert('Card successfully added to Google Wallet! 💳');
    }, 2500);
  };

  const handleCreateSavingsGoal = (e) => {
    e.preventDefault();
    if (!newGoalForm.name || !newGoalForm.target || !newGoalForm.date) return;

    const newGoal = {
      id: Date.now(),
      name: newGoalForm.name,
      target: parseFloat(newGoalForm.target),
      current: 0,
      icon: newGoalForm.icon,
      targetDate: newGoalForm.date,
      isLocked: true,
      hasWithdrawnEarly: false,
      repaymentDeadline: null,
      unpaidWithdrawal: 0
    };

    setSavingsGoals(prev => [...prev, newGoal]);
    setActiveModal(null);
    setNewGoalForm({ name: '', target: '', date: '', icon: '💰' });
    alert("New MoSavings Plan Created! 🚀 Your funds are now securely locked until the target date.");
  };

  const handleWithdrawSavings = (goalId) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal || goal.current <= 0) return;

    const amountStr = prompt(`How much would you like to withdraw from ${goal.name}? (Max ${formatCurrency(goal.current)})`, goal.current);
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0 || amount > goal.current) {
      alert("Invalid amount.");
      return;
    }

    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const isEarly = today < targetDate;

    if (isEarly) {
      if (!goal.hasWithdrawnEarly && !goal.repaymentDeadline) {
        const confirmFirst = window.confirm(
          `Early Withdrawal Alert!\n\nYou are withdrawing ${formatCurrency(amount)} before your goal date.\n\nSince this is your first early withdrawal, you have a 7-day grace period to repay this R ${amount.toFixed(2)}.\n\nIf not repaid within 7 days, a 5% penalty (R ${(amount * 0.05).toFixed(2)}) will be deducted from your remaining goal balance.\n\nProceed?`
        );
        if (confirmFirst) {
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 7);
          
          setSavingsGoals(prev => prev.map(g => 
            g.id === goalId ? { 
              ...g, 
              current: g.current - amount, 
              hasWithdrawnEarly: true, 
              repaymentDeadline: deadline.toISOString(),
              unpaidWithdrawal: amount 
            } : g
          ));
          setUser(prev => ({ ...prev, balance: prev.balance + amount }));
          alert(`Funds withdrawn! You have until ${deadline.toLocaleDateString()} to repay R ${amount.toFixed(2)} to avoid the 5% penalty.`);
        }
      } else {
        const penalty = amount * 0.05;
        const confirmPenalty = window.confirm(
          `Early Withdrawal Penalty!\n\nA 5% penalty (R ${penalty.toFixed(2)}) will be applied to this R ${amount.toFixed(2)} withdrawal.\n\nProceed?`
        );
        if (confirmPenalty) {
          const finalAmount = amount - penalty;
          setSavingsGoals(prev => prev.map(g => 
            g.id === goalId ? { ...g, current: g.current - amount } : g
          ));
          setUser(prev => ({ ...prev, balance: prev.balance + finalAmount }));
          alert(`Funds withdrawn! R ${penalty.toFixed(2)} penalty was deducted from the withdrawn amount.`);
        }
      }
    } else {
      setSavingsGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, current: g.current - amount } : g
      ));
      setUser(prev => ({ ...prev, balance: prev.balance + amount }));
      alert("Withdrawal successful! Your funds have been moved to your main balance.");
    }
  };

  const handleRepaySavings = (goalId) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal || !goal.unpaidWithdrawal) return;

    const repayAmount = goal.unpaidWithdrawal;
    if (user.balance < repayAmount) {
      alert("Insufficient balance to repay this goal.");
      return;
    }

    const confirmRepay = window.confirm(`Repay R ${repayAmount.toFixed(2)} to ${goal.name}? This will clear your grace period and avoid any penalties.`);
    if (confirmRepay) {
      setUser(prev => ({ ...prev, balance: prev.balance - repayAmount }));
      setSavingsGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, current: g.current + repayAmount, repaymentDeadline: null, unpaidWithdrawal: 0 } : g
      ));
      alert("Repayment successful! Your grace period has been cleared.");
    }
  };

  const handleDepositSavings = (goalId) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const amountStr = prompt(`Enter amount to add to ${goal.name}:`, '100');
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0 || amount > user.balance) {
      alert("Invalid amount or insufficient balance.");
      return;
    }

    setUser(prev => ({ ...prev, balance: prev.balance - amount }));
    setSavingsGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, current: g.current + amount } : g
    ));
    alert(`${formatCurrency(amount)} added to ${goal.name}!`);
  };

  const handleClaimVoucher = (id) => {
    setMoPulse(prev => ({
      ...prev,
      vouchers: prev.vouchers.map(v => v.id === id ? { ...v, claimed: true } : v)
    }));
    alert("Voucher Claimed! Check your MoBank Digital Receipt for the code.");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getAnalyticsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      const dayHistory = history.filter(t => new Date(t.created_at).getDay() === (idx + 1) % 7);
      const spending = dayHistory.reduce((acc, t) => acc + (t.sender_id === user.id ? parseFloat(t.amount) : 0), 0);
      const income = dayHistory.reduce((acc, t) => acc + (t.sender_id !== user.id ? parseFloat(t.amount) : 0), 0);
      return {
        name: day,
        spending: spending || Math.floor(Math.random() * 500) + 100,
        savings: (income || Math.floor(Math.random() * 1000) + 500) - spending,
        balance: user.balance - (spending * (7 - idx))
      };
    });
  };

  const getPieData = () => [
    { name: 'Savings', value: 8000, color: '#4f46e5' },
    { name: 'Spending', value: 4000, color: '#ef4444' },
    { name: 'Crypto', value: 3000, color: '#10b981' },
  ];

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setActiveTab('dashboard');
  };

  if (!user) {
    return (
      <div className="bank-app-landing">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bank-app-landing"
            >
              <div className="mo-header">
                <div className="logo-pill">
                  <Wallet size={24} color="#4f46e5" />
                  <span>MoBank</span>
                </div>
              </div>
              <div className="landing-hero-section">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <p className="hero-text">The World's First <br/><span>Unified</span> Bank</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1rem' }}>
                    Aggregate all your banks. One MoCard to rule them all.
                  </p>
                </div>
                
                <div className="card-selector-container">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={selectedCardTier}
                      initial={{ x: 50, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -50, opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="landing-hero-card-wrapper"
                    >
                      <img 
                        src={cardTiers[selectedCardTier].img} 
                        alt={cardTiers[selectedCardTier].name} 
                        className="landing-hero-img-animated" 
                      />
                      <div className="card-tier-info">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                          <ShieldCheck size={16} color="var(--mo-indigo)" />
                          <h3 style={{ margin: 0 }}>{cardTiers[selectedCardTier].name.split(' (')[0]}</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
                          Auto-assigned based on your total aggregated wealth.
                        </p>
                        <div className="tier-benefits">
                          {cardTiers[selectedCardTier].benefits.map((b, i) => (
                            <span key={i} className="benefit-tag">{b}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="tier-dots">
                    {cardTiers.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`tier-dot ${selectedCardTier === idx ? 'active' : ''}`}
                        onClick={() => setSelectedCardTier(idx)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', margin: '2rem 0' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <Scan size={20} color="var(--mo-indigo)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ margin: 0, fontSize: '0.8rem' }}>Auto-Discovery</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Scan & link all your accounts via MoID instantly.</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <Zap size={20} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ margin: 0, fontSize: '0.8rem' }}>Smart Routing</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI selects the best account for every transaction.</p>
                </div>
              </div>

              <div className="landing-title" style={{ marginBottom: '1.5rem' }}>
                Financial Control. <br/><span>Reimagined.</span>
              </div>
              <div className="landing-auth-container">
                <button className="btn-mo-primary" onClick={() => setStep(1.5)}>Get Started with MoBank</button>
                <div className="mo-version">
                  MoBank Mobile v2.0.1 [Production] <br/>
                  Secure Device ID: 403017098
                </div>
              </div>
            </motion.div>
          ) : step === 1.5 ? (
            <motion.div 
              key="login-form"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bank-app-landing"
            >
              <div className="mo-header">
                <button className="back-btn" onClick={() => setStep(1)}>←</button>
                <h2>MoBank Login</h2>
              </div>
              <div className="auth-card-app mo-style">
                <form onSubmit={handleRequestOTP}>
                  <div className="input-group-app">
                    <label>Secure Mobile Link</label>
                    <input type="tel" placeholder="+27..." value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-mo-primary">Continue to MoBank</button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="verify"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bank-app-landing"
            >
              <div className="mo-header">
                <button className="back-btn" onClick={() => setStep(1.5)}>←</button>
                <h2>MoVerification</h2>
              </div>
              <div className="auth-card-app mo-style">
                <p>{isScanning ? 'MoAI is scanning for your accounts...' : `Enter the MoCode sent to ${phone}`}</p>
                {message && <p className="error-msg" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600, textAlign: 'center' }}>{message}</p>}
                {isScanning ? (
                  <div className="scanning-container" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="mo-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--mo-indigo)' }}>Discovering linked bank accounts via MoID...</p>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="input-group-app">
                      <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required autoFocus />
                    </div>
                    <button type="submit" className="btn-mo-primary">Secure Access</button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <main className="content mo-app-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {activeTab === 'dashboard' && (
              <div className="mo-dashboard">
                <header className="mo-app-header">
                  <h1>MoBank</h1>
                  <div className="header-icons">
                    <div className="mail-badge" onClick={() => { setActiveTab('more'); setActiveModal('notifications'); }}>
                      <Bell size={20} />
                      <span>12</span>
                    </div>
                  </div>
                </header>

                <div className="mo-dashboard-summary">
                  <div className="summary-row">
                    <div className="summary-item">
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unified MoBalance</span>
                      <div style={{ fontSize: '2.25rem', fontWeight: 900, margin: '0.25rem 0' }}>{formatCurrency(totalBalance)}</div>
                      <div className={`status-indicator status-${creditClass}`}>
                        <ShieldCheck size={14} /> {creditStatus} Health
                      </div>
                    </div>
                    <div className="credit-score-circle" style={{ borderColor: creditScore >= 750 ? '#10b981' : creditScore >= 680 ? '#3b82f6' : '#f59e0b' }}>
                      <span className="score">{creditScore}</span>
                      <span className="label-mini">Credit</span>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mo-indigo)', fontSize: '0.75rem', fontWeight: 800 }}>
                      <Zap size={14} /> Assigned: {cardTiers[selectedCardTier].name.split(' (')[0]} Status
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      Aggregated from {moAccounts.length + 1} linked accounts
                    </div>
                  </div>
                </div>

                <div className="vitality-section" style={{ padding: '0 0 2rem' }}>
                  <h3>Linked Accounts</h3>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                    <div className="discovery-account-card capitec-theme-card" style={{ minWidth: '220px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>CAPITEC</span>
                        <div className="bank-mini-logo" style={{ width: '24px', height: '24px' }}>
                          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Capitec_Bank_logo.svg/1200px-Capitec_Bank_logo.svg.png" alt="" />
                        </div>
                      </div>
                      <div className="acc-balance" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{formatCurrency(12500.50)}</div>
                      <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.8 }}>Everyday Savings • 1870</p>
                    </div>
                    <div className="discovery-account-card fnb-theme-card" style={{ minWidth: '220px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>FNB</span>
                        <div className="bank-mini-logo" style={{ width: '24px', height: '24px' }}>
                          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/First_National_Bank_Logo.svg/1200px-First_National_Bank_Logo.svg.png" alt="" />
                        </div>
                      </div>
                      <div className="acc-balance" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{formatCurrency(45200.00)}</div>
                      <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.8 }}>Gold Fusion • 1833</p>
                    </div>
                    <div className="discovery-account-card discovery-theme-card" style={{ minWidth: '220px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>DISCOVERY</span>
                        <div className="bank-mini-logo" style={{ width: '24px', height: '24px' }}>
                          <img src="https://www.discovery.co.za/discovery_coza/assets/images/discovery-bank-logo.png" alt="" />
                        </div>
                      </div>
                      <div className="acc-balance" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{formatCurrency(8500.25)}</div>
                      <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.8 }}>Vitality Savings • 4655</p>
                      <span className="best-option-tag">Max Rewards</span>
                    </div>
                  </div>
                </div>

                <div className="quick-actions-grid">
                  <div className="quick-action-item" onClick={handleTopUp}>
                    <div className="action-icon-wrapper"><Plus size={20}/></div>
                    <span>Top Up</span>
                  </div>
                  <div className="quick-action-item" onClick={() => setActiveTab('transfer')}>
                    <div className="action-icon-wrapper"><Send size={20}/></div>
                    <span>Send</span>
                  </div>
                  <div className="quick-action-item" onClick={() => setActiveTab('transact')}>
                    <div className="action-icon-wrapper"><Scan size={20}/></div>
                    <span>Scan</span>
                  </div>
                  <div className="quick-action-item" onClick={() => setActiveTab('history')}>
                    <div className="action-icon-wrapper"><History size={20}/></div>
                    <span>History</span>
                  </div>
                </div>

                <div className="portfolio-tabs">
                  <div className={`p-tab ${activePortfolioTab === 'banking' ? 'active' : ''}`} onClick={() => setActivePortfolioTab('banking')}><div className="icon"></div><span>Banking</span></div>
                  <div className={`p-tab ${activePortfolioTab === 'wealth' ? 'active' : ''}`} onClick={() => setActivePortfolioTab('wealth')}><div className="icon"></div><span>Wealth</span></div>
                  <div className={`p-tab ${activePortfolioTab === 'crypto' ? 'active' : ''}`} onClick={() => setActivePortfolioTab('crypto')}><div className="icon"></div><span>Crypto</span></div>
                  <div className={`p-tab ${activePortfolioTab === 'savings' ? 'active' : ''}`} onClick={() => setActivePortfolioTab('savings')}><div className="icon"></div><span>Savings</span></div>
                  <div className={`p-tab ${activePortfolioTab === 'insurance' ? 'active' : ''}`} onClick={() => setActivePortfolioTab('insurance')}><div className="icon"></div><span>Insurance</span></div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePortfolioTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="portfolio-tab-content"
                  >
                    {activePortfolioTab === 'banking' && (
                      <div className="portfolio-card-wrapper">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                          <span className="best-option-tag" style={{ background: 'var(--mo-indigo)', color: 'white', fontSize: '0.75rem' }}>
                            {cardTiers[selectedCardTier].name.split(' (')[0]} Status Activated
                          </span>
                        </div>
                        <div className="card-flip-container" onClick={() => setIsFlipped(!isFlipped)}>
                          <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
                            <div className={`card-front ${cardTiers[selectedCardTier].theme}-theme`}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="card-chip"></div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>MoBank</div>
                              </div>
                              <div className="card-number-display">
                                {cards[0]?.card_number ? (
                                  `**** **** **** ${cards[0].card_number.slice(-4)}`
                                ) : (
                                  '4123 4567 8901 2345'
                                )}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                  <div className="card-holder-display">{user?.phone || 'MoBank User'}</div>
                                  <div className="card-expiry-display">12/29</div>
                                </div>
                                <div className="card-vendor">VISA</div>
                              </div>
                            </div>
                            <div className="card-back">
                              <div className="black-strip"></div>
                              <div className="back-content">
                                <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>AUTHORIZED SIGNATURE</p>
                                <div className="cvv-section">999</div>
                              </div>
                              <div className="back-footer" style={{ fontSize: '0.6rem', textAlign: 'left' }}>
                                This {cardTiers[selectedCardTier].name} is property of MoBank. If found, please return to any MoBank branch.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activePortfolioTab === 'wealth' && (
                      <div className="portfolio-card-wrapper">
                        <div className="mo-card-portfolio wealth-theme">
                          <h3>Investment Portfolio</h3>
                          <div className="main-balance">{formatCurrency(45200.50)}</div>
                          <p className="label">+8.4% Growth this year</p>
                          <div className="wealth-stats" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <div><span>Equities</span><p>R 30,000</p></div>
                            <div><span>Bonds</span><p>R 15,200</p></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activePortfolioTab === 'crypto' && (
                      <div className="portfolio-card-wrapper">
                        <div className="mo-card-portfolio crypto-theme">
                          <h3>Crypto Assets</h3>
                          <div className="main-balance">{cryptoWallet?.balance || 0} SOL</div>
                          <p className="label">≈ {formatCurrency((cryptoWallet?.balance || 0) * (prices?.solana?.zar || 0))}</p>
                          <button className="mo-action-btn" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('transact')}>Buy More</button>
                        </div>
                      </div>
                    )}
                    {activePortfolioTab === 'savings' && (
                      <div className="portfolio-card-wrapper">
                        <div className="mo-card-portfolio savings-theme">
                          <h3>Savings Vaults</h3>
                          <div className="main-balance">{formatCurrency(savingsGoals.reduce((acc, g) => acc + g.current, 0))}</div>
                          <p className="label">Total Saved across {savingsGoals.length} goals</p>
                          <button className="mo-action-btn" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('savings')}>View Goals</button>
                        </div>
                      </div>
                    )}
                    {activePortfolioTab === 'insurance' && (
                      <div className="portfolio-card-wrapper">
                        <div className="mo-card-portfolio insurance-theme">
                          <h3>MoInsurance</h3>
                          <div className="active-policies" style={{ textAlign: 'left' }}>
                            <div className="policy-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span>Device Cover</span>
                              <strong>Active</strong>
                            </div>
                            <div className="policy-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Life Cover</span>
                              <strong>Pending</strong>
                            </div>
                          </div>
                          <button className="mo-action-btn" style={{ marginTop: '1rem' }}>Get Quote</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="vitality-section">
                  <h3>MoRewards Status</h3>
                  <div className="vitality-card alert" onClick={() => setActiveTab('kyc')} style={{ cursor: 'pointer' }}>
                    <h4>Build your MoScore</h4>
                    <p>Complete your KYC and maintain a healthy balance to unlock exclusive MoBank rewards and lower interest rates.</p>
                  </div>
                  <h3>MoPulse Active Rewards</h3>
                  <div className="vitality-card rewards" onClick={() => setActiveModal('rewards')} style={{ cursor: 'pointer' }}>
                    <div className="vitality-rings">
                      <div className="ring-container">
                        <div className="ring ring-1" style={{ borderTopColor: 'var(--mo-mint)', transform: `rotate(${moPulse.rings.exercise * 3.6}deg)` }}></div>
                        <div className="ring ring-2" style={{ borderTopColor: 'var(--mo-indigo)', transform: `rotate(${moPulse.rings.finance * 3.6}deg)` }}></div>
                        <div className="ring ring-3" style={{ borderTopColor: '#f472b6', transform: `rotate(${moPulse.rings.social * 3.6}deg)` }}></div>
                        <div className="ring-center" style={{ color: 'var(--mo-indigo)' }}>M</div>
                      </div>
                    </div>
                    <div className="rewards-stats">
                      <div className="stat">
                        <div className="icon coffee"></div>
                        <div>
                          <strong>{moPulse.vouchers.filter(v => !v.claimed).length}</strong>
                          <span>Vouchers Unclaimed</span>
                        </div>
                      </div>
                      <div className="stat">
                        <div className="icon grid"></div>
                        <div>
                          <strong>{moPulse.score}</strong>
                          <span>MoScore</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="mo-accounts" style={{ padding: '0 1.5rem' }}>
                <header className="mo-app-header" style={{ padding: '2rem 0' }}>
                  <h1>MoAccounts</h1>
                  <button className="btn-mo-outline" onClick={handleLinkMore} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                    <Scan size={14} style={{ marginRight: '5px' }} /> Auto-Discover
                  </button>
                </header>

                <div className="account-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="discovery-account-card" style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="acc-details">
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Main MoWallet</h4>
                        <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>MoBank Primary • 870</p>
                        <div className="acc-balance" style={{ fontSize: '1.5rem', fontWeight: 900, margin: '1rem 0' }}>{formatCurrency(user.balance)}</div>
                      </div>
                      <div className="bank-mini-logo" style={{ background: 'var(--mo-indigo)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>M</div>
                    </div>
                  </div>

                  {moAccounts.map(acc => (
                    <div key={acc.id} className="discovery-account-card" style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="acc-details">
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{acc.name}</h4>
                          <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{acc.type} • {acc.number.slice(-4)}</p>
                          <div className="acc-balance" style={{ fontSize: '1.5rem', fontWeight: 900, margin: '1rem 0' }}>{formatCurrency(acc.balance)}</div>
                          <button 
                            className="btn-mo-outline" 
                            onClick={() => handleDelinkAccount(acc.id)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem', color: '#ef4444', borderColor: '#fee2e2' }}
                          >
                            Delink Account
                          </button>
                        </div>
                        <div className="bank-mini-logo">
                          <img src={acc.logo} alt={acc.name} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="add-account-card" onClick={handleAddAccount} style={{ cursor: 'pointer', border: '2px dashed #e2e8f0', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                    <div className="add-icon" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}><Plus size={32} /></div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Link Account Manually</h3>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transact' && (
              <div className="mo-transact">
                <header className="mo-app-header">
                  <h1>MoTransact</h1>
                </header>
                <div className="payments-container" style={{ padding: '1rem' }}>
                  <div className="payment-type-selector">
                    <button className={paymentType === 'airtime' ? 'active' : ''} onClick={() => setPaymentType('airtime')}><Smartphone size={24} /><span>MoAirtime</span></button>
                    <button className={paymentType === 'electricity' ? 'active' : ''} onClick={() => setPaymentType('electricity')}><Zap size={24} /><span>MoPower</span></button>
                    <button className={paymentType === 'bill' ? 'active' : ''} onClick={() => setPaymentType('bill')}><Receipt size={24} /><span>MoBills</span></button>
                    <button className={paymentType === 'vouchers' ? 'active' : ''} onClick={() => setPaymentType('vouchers')}><Ticket size={24} /><span>MoVouchers</span></button>
                    <button className={paymentType === 'insurance' ? 'active' : ''} onClick={() => setPaymentType('insurance')}><ShieldCheck size={24} /><span>MoInsurance</span></button>
                    <button className={paymentType === 'payshap' ? 'active' : ''} onClick={() => setPaymentType('payshap')}><Zap size={24} color="#f59e0b" /><span>PayShap</span></button>
                    <button onClick={() => setActiveTab('transfer')} style={{ background: 'var(--mo-indigo)', color: 'white' }}><Send size={24} /><span>MoSend</span></button>
                  </div>
                  <div className="section-card form-section payment-form-card" style={{ marginTop: '2rem' }}>
                    <h3>{paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} Secure Payment</h3>
                    <form onSubmit={handlePaymentSubmit}>
                      <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Pay From Account</label>
                        <div className="account-selector-grid">
                          <div 
                            className={`account-select-item ${selectedAccountId === 0 ? 'active' : ''}`}
                            onClick={() => setSelectedAccountId(0)}
                          >
                            <div className="bank-mini-logo"><img src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png" alt="MoBank" /></div>
                            <div className="account-info-mini">
                              <h5>MoBank Wallet</h5>
                              <p>Primary Account</p>
                              {getBestAccount(paymentType) === 0 && <span className="best-option-tag">Lowest Fees</span>}
                            </div>
                            <div className="account-balance-mini">{formatCurrency(user.balance)}</div>
                          </div>
                          {moAccounts.map(acc => (
                            <div 
                              key={acc.id}
                              className={`account-select-item ${selectedAccountId === acc.id ? 'active' : ''}`}
                              onClick={() => setSelectedAccountId(acc.id)}
                            >
                              <div className="bank-mini-logo"><img src={acc.logo} alt={acc.name} /></div>
                              <div className="account-info-mini">
                                <h5>{acc.name}</h5>
                                <p>{acc.type}</p>
                                {acc.isBestForRewards && <span className="best-option-tag">Max Rewards</span>}
                                {getBestAccount(paymentType) === acc.id && !acc.isBestForRewards && <span className="best-option-tag">Best Option</span>}
                              </div>
                              <div className="account-balance-mini">{formatCurrency(acc.balance)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {paymentType === 'airtime' && (
                        <div className="form-group">
                          <label>Select Network Provider</label>
                          <div className="brand-grid">
                            {[
                              { id: 'Vodacom', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Vodacom_Logo.svg' },
                              { id: 'MTN', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg' },
                              { id: 'Cell C', logo: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/cellc_logo_icon_171253.png' },
                              { id: 'Telkom', logo: 'https://www.telkom.co.za/today/media/desktop/telkom-logo.png' }
                            ].map(brand => (
                              <div 
                                key={brand.id}
                                className={`brand-item ${paymentForm.biller === brand.id ? 'active' : ''}`}
                                onClick={() => setPaymentForm({...paymentForm, biller: brand.id})}
                              >
                                <div className="brand-logo-wrapper">
                                  <img src={brand.logo} alt={brand.id} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=' + brand.id }} />
                                </div>
                                <span>{brand.id}</span>
                              </div>
                            ))}
                          </div>
                          <label>Recipient Mobile</label>
                          <input type="tel" placeholder="+27..." value={paymentForm.phone} onChange={(e) => setPaymentForm({...paymentForm, phone: e.target.value})} required />
                        </div>
                      )}
                      {paymentType === 'electricity' && (
                        <div className="form-group">
                          <label>Select Provider</label>
                          <div className="brand-grid">
                            {[
                              { id: 'Eskom', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Eskom-Logo.png' },
                              { id: 'City Power', logo: 'https://www.joburg.org.za/PublishingImages/City%20Power%20Logo.png' },
                              { id: 'Municipal', logo: 'https://cdn-icons-png.flaticon.com/512/1048/1048953.png' }
                            ].map(brand => (
                              <div 
                                key={brand.id}
                                className={`brand-item ${paymentForm.biller === brand.id ? 'active' : ''}`}
                                onClick={() => setPaymentForm({...paymentForm, biller: brand.id})}
                              >
                                <div className="brand-logo-wrapper">
                                  <img src={brand.logo} alt={brand.id} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=' + brand.id }} />
                                </div>
                                <span>{brand.id}</span>
                              </div>
                            ))}
                          </div>
                          <label>MoMeter Number</label>
                          <input type="text" placeholder="Meter number..." value={paymentForm.meterNumber} onChange={(e) => setPaymentForm({...paymentForm, meterNumber: e.target.value})} required />
                        </div>
                      )}
                      {paymentType === 'bill' && (
                        <div className="form-group">
                          <label>Select MoBiller</label>
                          <div className="brand-grid">
                            {[
                              { id: 'DStv', logo: 'https://logos-world.net/wp-content/uploads/2023/03/DStv-Logo.png' },
                              { id: 'Water', logo: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png' },
                              { id: 'Rates', logo: 'https://cdn-icons-png.flaticon.com/512/609/609803.png' }
                            ].map(brand => (
                              <div 
                                key={brand.id}
                                className={`brand-item ${paymentForm.biller === brand.id ? 'active' : ''}`}
                                onClick={() => setPaymentForm({...paymentForm, biller: brand.id})}
                              >
                                <div className="brand-logo-wrapper">
                                  <img src={brand.logo} alt={brand.id} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=' + brand.id }} />
                                </div>
                                <span>{brand.id}</span>
                              </div>
                            ))}
                          </div>
                          <label>Account Reference</label>
                          <input type="text" placeholder="Reference number..." value={paymentForm.accountReference} onChange={(e) => setPaymentForm({...paymentForm, accountReference: e.target.value})} required />
                        </div>
                      )}
                      {paymentType === 'vouchers' && (
                        <div className="form-group">
                          <label>Select Brand</label>
                          <div className="brand-grid">
                            {[
                              { id: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
                              { id: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
                              { id: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
                              { id: 'BlueVoucher', logo: 'https://www.flash.co.za/wp-content/uploads/2021/05/Blu-Voucher-Logo.png' },
                              { id: '1Voucher', logo: 'https://www.1voucher.co.za/assets/images/logo.png' },
                              { id: 'Showmax', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Showmax_logo.svg' },
                              { id: 'Roblox', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg' },
                              { id: 'Steam', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg' }
                            ].map(brand => (
                              <div 
                                key={brand.id}
                                className={`brand-item ${paymentForm.voucherType === brand.id ? 'active' : ''}`}
                                onClick={() => setPaymentForm({...paymentForm, voucherType: brand.id})}
                              >
                                <div className="brand-logo-wrapper">
                                  <img src={brand.logo} alt={brand.id} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=' + brand.id }} />
                                </div>
                                <span>{brand.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {paymentType === 'insurance' && (
                        <div className="form-group">
                          <label>Select Insurance Type</label>
                          <div className="brand-grid">
                            {[
                              { id: 'Device', logo: 'https://cdn-icons-png.flaticon.com/512/644/644458.png', label: 'Device Cover' },
                              { id: 'Life', logo: 'https://cdn-icons-png.flaticon.com/512/2966/2966486.png', label: 'Life Cover' },
                              { id: 'Funeral', logo: 'https://cdn-icons-png.flaticon.com/512/3209/3209943.png', label: 'Funeral Cover' },
                              { id: 'Vehicle', logo: 'https://cdn-icons-png.flaticon.com/512/744/744465.png', label: 'Vehicle Cover' }
                            ].map(brand => (
                              <div 
                                key={brand.id}
                                className={`brand-item ${paymentForm.insuranceType === brand.id ? 'active' : ''}`}
                                onClick={() => setPaymentForm({...paymentForm, insuranceType: brand.id})}
                              >
                                <div className="brand-logo-wrapper">
                                  <img src={brand.logo} alt={brand.id} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=' + brand.id }} />
                                </div>
                                <span>{brand.label}</span>
                              </div>
                            ))}
                          </div>
                          <label>Select Plan Tier</label>
                          <div className="brand-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {[
                              { id: 'Basic', label: 'Basic Plan', price: 'R49/pm' },
                              { id: 'Standard', label: 'Standard Plan', price: 'R99/pm' },
                              { id: 'Premium', label: 'Premium Plan', price: 'R199/pm' },
                              { id: 'Elite', label: 'Elite Plan', price: 'R399/pm' }
                            ].map(plan => (
                              <div 
                                key={plan.id}
                                className={`brand-item ${paymentForm.insurancePlan === plan.id ? 'active' : ''}`}
                                onClick={() => setPaymentForm({...paymentForm, insurancePlan: plan.id})}
                                style={{ padding: '1rem' }}
                              >
                                <span style={{ fontSize: '0.85rem' }}>{plan.label}</span>
                                <strong style={{ color: 'var(--mo-indigo)' }}>{plan.price}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {paymentType === 'payshap' && (
                        <div className="form-group">
                          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <img src="https://www.payshap.co.za/wp-content/uploads/2023/03/PayShap-Logo-1.png" alt="PayShap" style={{ height: '40px', marginBottom: '0.5rem' }} onError={(e) => e.target.style.display='none'} />
                            <h4 style={{ margin: 0, color: '#f59e0b' }}>Instant Interbank Payments</h4>
                          </div>
                          <label>Recipient ShapID (Phone or ID)</label>
                          <input type="text" placeholder="e.g. 0712345678@payshap" value={paymentForm.shapID} onChange={(e) => setPaymentForm({...paymentForm, shapID: e.target.value})} required />
                          <div style={{ marginTop: '1rem' }}>
                            <label>Select Bank</label>
                            <div className="brand-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                              {[
                                { id: 'Absa', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/ABSA_Group_Limited_Logo.svg' },
                                { id: 'Capitec', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Capitec_Bank_logo.svg/1200px-Capitec_Bank_logo.svg.png' },
                                { id: 'FNB', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/First_National_Bank_Logo.svg/1200px-First_National_Bank_Logo.svg.png' },
                                { id: 'Nedbank', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Nedbank_logo.svg/1200px-Nedbank_logo.svg.png' },
                                { id: 'Standard', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Standard_Bank_logo.svg/1200px-Standard_Bank_logo.svg.png' },
                                { id: 'TymeBank', logo: 'https://www.tymebank.co.za/wp-content/uploads/2018/11/TymeBank-Logo-Standard.png' }
                              ].map(bank => (
                                <div 
                                  key={bank.id}
                                  className={`brand-item ${paymentForm.biller === bank.id ? 'active' : ''}`}
                                  onClick={() => setPaymentForm({...paymentForm, biller: bank.id})}
                                  style={{ padding: '0.75rem 0.25rem' }}
                                >
                                  <div className="brand-logo-wrapper" style={{ width: '32px', height: '32px' }}>
                                    <img src={bank.logo} alt={bank.id} onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=' + bank.id[0] }} />
                                  </div>
                                  <span style={{ fontSize: '0.6rem' }}>{bank.id}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="form-group"><label>Amount (R)</label><input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} required /></div>
                      <button type="submit" className="btn-mo-primary">Pay Securely</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transfer' && (
              <div className="mo-transfer" style={{ padding: '1.5rem' }}>
                <header className="mo-app-header" style={{ padding: '0 0 2rem' }}>
                  <button className="back-btn" onClick={() => setActiveTab('transact')}>←</button>
                  <h1 style={{ margin: 0 }}>MoSend</h1>
                </header>
                <div className="section-card payment-form-card">
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="action-icon-wrapper" style={{ margin: '0 auto 1rem', width: '64px', height: '64px' }}>
                      <Send size={32} />
                    </div>
                    <h3 style={{ margin: 0 }}>Instant Peer-to-Peer Transfer</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Send funds securely to any MoBank user worldwide.</p>
                  </div>
                  <form onSubmit={handleTransfer}>
                    <div className="form-group">
                      <label>Recipient MoNumber</label>
                      <input type="tel" placeholder="+27..." value={transferData.phone} onChange={(e) => setTransferData({...transferData, phone: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Amount (ZAR)</label>
                      <input type="number" placeholder="0.00" value={transferData.amount} onChange={(e) => setTransferData({...transferData, amount: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Reference (Optional)</label>
                      <input type="text" placeholder="e.g. Dinner, Rent..." value={transferData.description} onChange={(e) => setTransferData({...transferData, description: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-mo-primary" style={{ width: '100%', marginTop: '1rem' }}>Confirm & Send</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="mo-cards-view">
                <header className="mo-app-header"><h1>MoCards</h1><Plus size={24} className="add-card-icon" onClick={createVirtualCard} /></header>
                <div className="cards-stack-section">
                  <h3>Secure MoWallet</h3>
                  <p className="acc-holder">MoAccount Holder: {user.phone}</p>
                  <div className="cards-stack-visual" onClick={() => setIsFlipped(!isFlipped)} style={{ cursor: 'pointer' }}>
                    <div className="card-flip-container" style={{ margin: 0, width: '100%' }}>
                      <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
                        <div className={`card-front ${cardTiers[selectedCardTier].theme}-theme`} style={{ width: '100%', height: '200px', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-chip"></div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>MoBank</div>
                          </div>
                          <div className="card-number-display">
                            {cards[0]?.card_number ? (
                              `**** **** **** ${cards[0].card_number.slice(-4)}`
                            ) : (
                              '4123 4567 8901 2345'
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                              <div className="card-holder-display">{user?.phone || 'MoBank User'}</div>
                              <div className="card-expiry-display">12/29</div>
                            </div>
                            <div className="card-vendor">VISA</div>
                          </div>
                        </div>
                        <div className="card-back"><div className="black-strip"></div><div className="back-content"><p style={{ fontSize: '0.7rem', opacity: 0.7 }}>AUTHORIZED SIGNATURE</p><div className="cvv-section">999</div></div><div className="back-footer" style={{ fontSize: '0.6rem', textAlign: 'left' }}>This {cardTiers[selectedCardTier].name} is property of MoBank.</div></div>
                      </div>
                    </div>
                  </div>
                  <div className="stack-status"><div className="status-item"><strong>Active</strong></div><div className="status-item"><strong>{cardTiers[selectedCardTier].name}</strong></div></div>
                </div>
                <div className="google-wallet-strip" onClick={handleGoogleWallet} style={{ cursor: 'pointer' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Wallet_Icon_2022.svg" alt="Google Wallet" />
                  <span>{googleWalletStatus === 'not_added' && 'MoBank is ready for Google Wallet'}{googleWalletStatus === 'adding' && 'Adding to Google Wallet...'}{googleWalletStatus === 'added' && 'Card added to Google Wallet ✓'}</span>
                </div>
                <div className="discovery-list-menu">
                  <div className="menu-item" onClick={() => setActiveTab('history')}><div className="item-icon"><FileText size={20}/></div><span>MoTransactions</span><ChevronRight size={20}/></div>
                  <div className="menu-item" onClick={() => setActiveModal('virtual-cards')}><div className="item-icon"><Smartphone size={20}/></div><span>Virtual MoCards</span><ChevronRight size={20}/></div>
                  <div className="menu-item" onClick={() => setActiveModal('limits')}><div className="item-icon"><Shield size={20}/></div><span>MoLimits</span><ChevronRight size={20}/></div>
                  <div className="menu-item" onClick={() => setIsFlipped(!isFlipped)}><div className="item-icon"><Info size={20}/></div><span>Show card details (Flip)</span><ChevronRight size={20}/></div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="mo-history" style={{ padding: '1rem' }}>
                <header className="mo-app-header"><button className="back-btn" onClick={() => setActiveTab('cards')}>←</button><h1>MoHistory</h1></header>
                <div className="history-list" style={{ marginTop: '1rem' }}>
                  {history.length === 0 ? (<div className="empty-history" style={{ textAlign: 'center', padding: '3rem 1rem' }}><History size={48} color="var(--text-muted)" style={{ opacity: 0.3 }} /><p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No transactions found yet.</p></div>) : history.map((t, idx) => (
                    <div key={t.id} className="menu-item" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className={`item-icon ${t.sender_id === user.id ? 'pink' : 'success'}`}>{t.sender_id === user.id ? <ArrowRight size={20}/> : <Plus size={20}/>}</div>
                      <div style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 600 }}>{t.description || 'MoTransaction'}</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</span></div>
                      <span className={t.sender_id === user.id ? 'negative' : 'positive'} style={{ fontWeight: 700, color: t.sender_id === user.id ? '#ef4444' : '#10b981' }}>{t.sender_id === user.id ? '-' : '+'}{formatCurrency(t.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'more' && (
              <div className="mo-more">
                <header className="mo-app-header"><h1>MoMore</h1></header>
                <div className="more-section">
                  <h3>MoBanking</h3>
                  <div className="discovery-list-menu">
                    <div className="menu-item" onClick={() => setActiveTab('savings')}><div className="item-icon pink"><Target size={20}/></div><span>MoSavings Vaults</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveModal('beneficiaries')}><div className="item-icon pink"><User size={20}/></div><span>MoBeneficiaries</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveModal('notifications')}><div className="item-icon pink"><Bell size={20}/></div><span>MoNotifications</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveTab('kyc')}><div className="item-icon pink"><Shield size={20}/></div><span>MoVerification (KYC)</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveTab('profile')}><div className="item-icon pink"><User size={20}/></div><span>MoProfile & Settings</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveTab('analytics')}><div className="item-icon pink"><PieChart size={20}/></div><span>MoAnalytics</span><ChevronRight size={20}/></div>
                  </div>
                  <h3>MoPayments</h3>
                  <div className="discovery-list-menu">
                    <div className="menu-item" onClick={() => setActiveTab('crypto')}><div className="item-icon purple"><Coins size={20}/></div><span>MoCrypto Wallet</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveModal('rewards')}><div className="item-icon purple"><Zap size={20}/></div><span>MoPulse Rewards</span><ChevronRight size={20}/></div>
                    <div className="menu-item" onClick={() => setActiveModal('contact-payments')}><div className="item-icon purple"><Send size={20}/></div><span>MoContact Payments</span><ChevronRight size={20}/></div>
                  </div>
                  <div className="logout-action"><button className="btn-logout-mo" onClick={logout}>Log out of MoBank</button></div>
                </div>
              </div>
            )}

            {activeTab === 'savings' && (
              <div className="mo-savings" style={{ padding: '1rem' }}>
                <header className="mo-app-header"><button className="back-btn" onClick={() => setActiveTab('more')}>←</button><h1>MoSavings</h1><Plus size={24} className="add-card-icon" onClick={() => setActiveModal('create-savings')} /></header>
                <div className="goals-grid" style={{ marginTop: '1rem' }}>
                  {savingsGoals.map(goal => (
                    <div key={goal.id} className="goal-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
                        <div className="goal-icon">{goal.icon}</div>
                        <div className="goal-info" style={{ flex: 1 }}><h4 style={{ margin: 0 }}>{goal.name}</h4><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {new Date(goal.targetDate).toLocaleDateString()}</span></div>
                        {goal.isLocked && <Shield size={16} color="var(--mo-indigo)" />}
                      </div>
                      <div className="goal-progress-bar" style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', margin: '1rem 0' }}><div style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%`, height: '100%', background: 'var(--mo-mint)', borderRadius: '3px' }}></div></div>
                      <div className="goal-stats" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span>{formatCurrency(goal.current)} of {formatCurrency(goal.target)}</span><span style={{ fontWeight: 'bold', color: 'var(--mo-indigo)' }}>{Math.round((goal.current / goal.target) * 100)}%</span></div>
                      {goal.repaymentDeadline && (<div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', width: '100%' }}><p style={{ margin: 0, fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}><span>REPAY BY:</span><CountdownTimer deadline={goal.repaymentDeadline} /></p><p style={{ margin: '5px 0 0', fontSize: '0.65rem', color: '#ef4444' }}>Repay {formatCurrency(goal.unpaidWithdrawal)} to avoid 5% penalty.</p></div>)}
                      <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '1.5rem' }}>
                        {goal.repaymentDeadline ? (<button className="btn-mo-primary sm" onClick={() => handleRepaySavings(goal.id)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', background: '#ef4444' }}>Repay Now</button>) : (
                          <><button className="mo-action-btn sm" onClick={() => handleWithdrawSavings(goal.id)} style={{ background: '#f8fafc', fontSize: '0.75rem' }}>Withdraw</button><button className="btn-mo-primary sm" onClick={() => handleDepositSavings(goal.id)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>Add Funds</button></>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="add-account-card" onClick={() => setActiveModal('create-savings')} style={{ cursor: 'pointer', marginTop: '1.5rem' }}><div className="add-icon"><Plus size={32} /></div><h3>Create New Savings Plan</h3></div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="mo-kyc" style={{ padding: '1rem' }}>
                <header className="mo-app-header"><button className="back-btn" onClick={() => setActiveTab('more')}>←</button><h1>MoVerification</h1></header>
                <div className="section-card" style={{ marginTop: '2rem' }}>
                  {isScanning ? (<div className="scanning-ui">MoAI is verifying...</div>) : user.kyc_status === 'verified' ? (<div className="kyc-success">Verified MoUser!</div>) : (
                    <form onSubmit={handleKYCSubmit}><label>Identity Document Number</label><input type="text" placeholder="RSA ID Number" required style={{ marginBottom: '1rem' }} /><button type="submit" className="btn-mo-primary">Verify MoIdentity</button></form>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="mo-profile" style={{ padding: '1rem' }}>
                <header className="mo-app-header"><button className="back-btn" onClick={() => setActiveTab('more')}>←</button><h1>MoProfile</h1></header>
                <div className="section-card form-section" style={{ marginTop: '2rem' }}>
                  <div className="form-group"><label>Set Secure MoPIN</label><input type="password" maxLength="4" value={newPin} onChange={(e) => setNewPin(e.target.value)} /><button onClick={handleSetPin} className="btn-mo-primary" style={{ marginTop: '1rem' }}>Save MoPIN</button></div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="mo-analytics" style={{ padding: '1rem' }}>
                <header className="mo-app-header"><button className="back-btn" onClick={() => setActiveTab('more')}>←</button><h1>MoAnalytics</h1></header>
                <div className="analytics-overview" style={{ marginTop: '1rem' }}>
                  <div className="section-card">
                    <h3>Spending vs Savings</h3>
                    <div style={{ height: '250px', width: '100%', marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getAnalyticsData()}>
                          <defs>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorSave" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value)} />
                          <Area type="monotone" dataKey="spending" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} /><Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSave)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div><span style={{ fontSize: '0.8rem', color: '#64748b' }}>Spending</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div><span style={{ fontSize: '0.8rem', color: '#64748b' }}>Savings</span></div>
                    </div>
                  </div>
                  <div className="section-card" style={{ marginTop: '1.5rem' }}>
                    <h3>Asset Distribution</h3>
                    <div style={{ height: '200px', marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height="100%"><RePieChart><RePie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{getPieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</RePie><Tooltip /></RePieChart></ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="bottom-nav">
        <button type="button" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><div className="nav-icon home"></div><span>Home</span></button>
        <button type="button" className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}><div className="nav-icon accounts"></div><span>Accounts</span></button>
        <button type="button" className={`nav-item ${activeTab === 'transact' ? 'active' : ''}`} onClick={() => setActiveTab('transact')}><div className="nav-icon transact"></div><span>Transact</span></button>
        <button type="button" className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}><div className="nav-icon cards"></div><span>Cards</span></button>
        <button type="button" className={`nav-item ${activeTab === 'more' ? 'active' : ''}`} onClick={() => setActiveTab('more')}><div className="nav-icon more"></div><span>More</span></button>
      </nav>

      <div className="ai-widget">
        <AnimatePresence>
          {showAIChat && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="ai-chat-box">
              <div className="ai-chat-header"><span>Mo Assistant</span><button type="button" onClick={() => setShowAIChat(false)}>×</button></div>
              <div className="ai-chat-messages">{chatMessages.map((m, i) => <div key={i} className={`msg ${m.sender}`}>{m.text}</div>)}</div>
              <form onSubmit={handleAIChat} className="ai-chat-input"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask Mo..." /><button type="submit"><SendHorizonal size={18} /></button></form>
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" className="ai-toggle-btn" onClick={() => setShowAIChat(!showAIChat)}><div className="ai-ring"></div><div className="ai-ring-inner"><Coins size={30} /></div></button>
      </div>

      <AnimatePresence>
        {showPinModal && (
          <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="pin-modal" onClick={e => e.stopPropagation()}>
              <h3>Enter PIN</h3>
              <input type="password" maxLength="4" value={pinInput} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPinInput(val);
                if (val.length === 4) {
                  if (pinAction === 'transfer') executeTransfer(val);
                  if (pinAction === 'buy') executeBuyCrypto(val);
                  if (pinAction === 'payment') executePayment(val);
                }
              }} />
              <button type="button" onClick={() => setShowPinModal(false)}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && receiptData && (
          <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="receipt-modal" onClick={e => e.stopPropagation()}>
              <h3>Success</h3>
              <p>{receiptData.type}: {formatCurrency(receiptData.amount)}</p>
              {receiptData.token && <div className="token-code">{receiptData.token}</div>}
              <button type="button" onClick={() => setShowReceipt(false)}>Done</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal && ['limits', 'notifications', 'beneficiaries', 'rewards', 'virtual-cards', 'contact-payments', 'create-savings'].includes(activeModal) && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="action-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h3>{activeModal.replace('-', ' ').toUpperCase()}</h3><button type="button" className="close-btn" onClick={() => setActiveModal(null)}>×</button></div>
              <div className="modal-content">
                {activeModal === 'limits' && (
                  <div className="limits-list">
                    <div className="limit-item"><span>Daily Transfer</span><div style={{ textAlign: 'right' }}><strong>{formatCurrency(moLimits.dailyTransfer)}</strong><input type="range" min="1000" max="100000" step="1000" value={moLimits.dailyTransfer} onChange={(e) => handleUpdateLimit('dailyTransfer', parseInt(e.target.value))} style={{ width: '100%', display: 'block', marginTop: '5px' }}/></div></div>
                    <div className="limit-item"><span>ATM Withdrawal</span><div style={{ textAlign: 'right' }}><strong>{formatCurrency(moLimits.atmWithdrawal)}</strong><input type="range" min="500" max="10000" step="500" value={moLimits.atmWithdrawal} onChange={(e) => handleUpdateLimit('atmWithdrawal', parseInt(e.target.value))} style={{ width: '100%', display: 'block', marginTop: '5px' }}/></div></div>
                    <div className="limit-item"><span>Online Purchase</span><div style={{ textAlign: 'right' }}><strong>{formatCurrency(moLimits.onlinePurchase)}</strong><input type="range" min="1000" max="50000" step="1000" value={moLimits.onlinePurchase} onChange={(e) => handleUpdateLimit('onlinePurchase', parseInt(e.target.value))} style={{ width: '100%', display: 'block', marginTop: '5px' }}/></div></div>
                    <button type="button" className="btn-mo-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveModal(null)}>Confirm New Limits</button>
                  </div>
                )}
                {activeModal === 'notifications' && (<div className="notif-list"><p className="empty-text">No new notifications. Your MoBank is secure!</p></div>)}
                {activeModal === 'beneficiaries' && (<div className="beneficiaries-list"><button type="button" className="add-btn-outline"><Plus size={16}/> Add New Beneficiary</button><p className="empty-text" style={{ marginTop: '1rem' }}>No beneficiaries saved yet.</p></div>)}
                {activeModal === 'rewards' && (
                  <div className="rewards-overview">
                    <div className="mo-score-display"><div className="score-value">{moPulse.score}</div><p>Your MoScore</p></div>
                    <div className="unlocked-features" style={{ marginBottom: '2rem' }}><h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '1rem' }}>UNLOCKED FEATURES</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{moPulse.unlocked.map(f => (<span key={f} style={{ background: 'var(--mo-mint)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>{f} ✓</span>))}</div></div>
                    <div className="vouchers-section">
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '1rem' }}>ACTIVE VOUCHERS</h4>
                      {moPulse.vouchers.filter(v => !v.claimed).length === 0 ? (<p className="empty-text">No new vouchers. Keep spending to earn!</p>) : moPulse.vouchers.map(v => (<div key={v.id} className="reward-item" style={{ alignItems: 'center' }}><div style={{ textAlign: 'left' }}><strong style={{ display: 'block' }}>R {v.amount} {v.brand}</strong><span style={{ fontSize: '0.7rem' }}>Exp: 30 days</span></div>{!v.claimed ? (<button type="button" className="btn-mo-primary sm" onClick={() => handleClaimVoucher(v.id)} style={{ padding: '6px 15px', fontSize: '0.8rem' }}>Claim</button>) : (<span style={{ color: 'var(--mo-mint)', fontWeight: 'bold' }}>CODE: {v.code}</span>)}</div>))}
                    </div>
                    <button type="button" className="btn-mo-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setActiveModal(null)}>Back to Home</button>
                  </div>
                )}
                {activeModal === 'virtual-cards' && (<div className="virtual-cards-list"><p className="empty-text">You don't have any virtual cards yet.</p><button type="button" className="btn-mo-primary" onClick={() => { createVirtualCard(); setActiveModal(null); }}>Create Virtual Card</button></div>)}
                {activeModal === 'contact-payments' && (<div className="contact-payments"><p className="empty-text">Sync your contacts to see who else uses MoBank!</p><button type="button" className="btn-mo-primary">Sync Contacts</button></div>)}
                {activeModal === 'create-savings' && (
                  <div className="create-savings-modal">
                    <form onSubmit={handleCreateSavingsGoal}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}><label>Goal Name</label><input type="text" placeholder="e.g. Dream House" value={newGoalForm.name} onChange={(e) => setNewGoalForm({ ...newGoalForm, name: e.target.value })} required /></div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}><label>Target Amount (R)</label><input type="number" placeholder="0.00" value={newGoalForm.target} onChange={(e) => setNewGoalForm({ ...newGoalForm, target: e.target.value })} required /></div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}><label>Target Date</label><input type="date" value={newGoalForm.date} onChange={(e) => setNewGoalForm({ ...newGoalForm, date: e.target.value })} required /></div>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}><label>Goal Icon</label><select value={newGoalForm.icon} onChange={(e) => setNewGoalForm({ ...newGoalForm, icon: e.target.value })}><option value="💰">💰 Money</option><option value="🏠">🏠 House</option><option value="🚗">🚗 Car</option><option value="✈️">✈️ Travel</option><option value="🎓">🎓 Education</option><option value="💍">💍 Engagement</option></select></div>
                      <button type="submit" className="btn-mo-primary" style={{ width: '100%' }}>Start Saving</button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
