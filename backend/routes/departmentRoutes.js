const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Get all is public to support Student Registration page selection
router.get('/', getAllDepartments);

// Admin-secured routes
router.post('/', protect, authorize('Admin'), createDepartment);
router.get('/:id', protect, authorize('Admin'), getDepartmentById);
router.put('/:id', protect, authorize('Admin'), updateDepartment);
router.delete('/:id', protect, authorize('Admin'), deleteDepartment);

module.exports = router;
