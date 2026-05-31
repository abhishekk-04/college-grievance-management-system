const express = require('express');
const router = express.Router();
const { getOwnProfile, updateOwnProfile, getStudentById, getAllStudents, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/profile', protect, getOwnProfile);
router.put('/profile', protect, authorize('Student'), updateOwnProfile);

// Admin-only actions
router.get('/', protect, authorize('Admin'), getAllStudents);
router.get('/:id', protect, authorize('Admin'), getStudentById);
router.delete('/:id', protect, authorize('Admin'), deleteStudent);

module.exports = router;
