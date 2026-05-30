const express = require('express');
const router = express.Router();
const { createFaculty, getAllFaculty, getFacultyById, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('Admin'), createFaculty);
router.get('/', protect, authorize('Admin'), getAllFaculty);
router.get('/:id', protect, authorize('Admin', 'Faculty'), getFacultyById);
router.put('/:id', protect, authorize('Admin', 'Faculty'), updateFaculty);
router.delete('/:id', protect, authorize('Admin'), deleteFaculty);

module.exports = router;
