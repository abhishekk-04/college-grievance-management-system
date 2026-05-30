const express = require('express');
const router = express.Router();
const { registerStudent, login, refreshToken, logout } = require('../controllers/authController');

router.post('/register', registerStudent);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
