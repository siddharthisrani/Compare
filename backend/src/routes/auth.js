const express = require('express');
const router = express.Router();
const { registerValidators, register, loginValidators, login } = require('../controllers/authController');

// Register admin/trainer (protect in production or allow initial seed)
router.post('/register', registerValidators, register);

// Login
router.post('/login', loginValidators, login);

module.exports = router;
