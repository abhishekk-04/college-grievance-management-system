const express = require('express');
const router = express.Router();
const { getPublicStats, getPublicReviews } = require('../controllers/publicController');

router.get('/stats', getPublicStats);
router.get('/reviews', getPublicReviews);

module.exports = router;
