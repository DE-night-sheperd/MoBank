const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

module.exports = (io) => {
  router.post('/transfer', authMiddleware, (req, res) => transactionController.transfer(req, res, io));
  router.get('/history', authMiddleware, transactionController.getHistory);
  return router;
};
