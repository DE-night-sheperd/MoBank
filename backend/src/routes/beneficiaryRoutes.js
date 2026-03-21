const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/list', authMiddleware, beneficiaryController.listBeneficiaries);
router.post('/add', authMiddleware, beneficiaryController.addBeneficiary);
router.delete('/:id', authMiddleware, beneficiaryController.deleteBeneficiary);

module.exports = router;
