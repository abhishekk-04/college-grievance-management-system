const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackForGrievance, getAllFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('Student'), submitFeedback);
router.get('/:grievanceId', protect, authorize('Admin', 'Faculty'), getFeedbackForGrievance);
router.get('/', protect, authorize('Admin'), getAllFeedback);

module.exports = router;
