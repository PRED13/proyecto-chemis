const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion } = require('../controllers/authController');

// --- REGISTRO ---
router.post('/register', registrarUsuario);

// --- LOGIN ---
router.post('/login', iniciarSesion);
module.exports = router;