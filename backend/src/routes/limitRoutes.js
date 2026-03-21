const express = require('express');
const router = express.Router();
const limitController = require('../controllers/limitController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, limitController.getLimits);
router.post('/update', authMiddleware, limitController.updateLimits);

module.exports = router;
