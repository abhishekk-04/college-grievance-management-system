const express = require('express');
const router = express.Router();
const { addResponse, getResponsesForGrievance } = require('../controllers/responseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addResponse);
router.get('/:grievanceId', protect, getResponsesForGrievance);

module.exports = router;
