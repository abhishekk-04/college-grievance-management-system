const express = require('express');
const router = express.Router();
const { getSummaryStats, getDepartmentReport, exportCSVReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/summary', protect, authorize('Admin'), getSummaryStats);
router.get('/department', protect, authorize('Admin'), getDepartmentReport);
router.get('/export', protect, authorize('Admin'), exportCSVReport);

module.exports = router;
