const express = require('express');
const router = express.Router();
const { 
  submitGrievance, 
  getAllGrievances, 
  getMyGrievances, 
  getDepartmentGrievances, 
  getGrievanceById, 
  getGrievanceByTicketId, 
  updateGrievanceStatus, 
  assignGrievance, 
  deleteGrievance,
  analyzeComplaintText
} = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student endpoints
router.post('/', protect, authorize('Student'), upload.array('attachments', 5), submitGrievance);
router.post('/analyze', protect, authorize('Student'), analyzeComplaintText);
router.get('/mine', protect, authorize('Student'), getMyGrievances);

// Faculty endpoints
router.get('/department', protect, authorize('Faculty', 'Admin'), getDepartmentGrievances);

// Admin endpoints
router.get('/', protect, authorize('Admin'), getAllGrievances);
router.put('/:id/assign', protect, authorize('Admin'), assignGrievance);
router.delete('/:id', protect, authorize('Admin'), deleteGrievance);

// Shared/Track endpoints
router.get('/:id', protect, getGrievanceById);
router.get('/ticket/:ticketId', protect, getGrievanceByTicketId);
router.put('/:id/status', protect, authorize('Faculty', 'Admin'), updateGrievanceStatus);

module.exports = router;
