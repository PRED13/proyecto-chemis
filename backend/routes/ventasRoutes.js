const express = require('express');
const router = express.Router();
const { completarVenta, obtenerHistorial } = require('../controllers/ventasController');
const { verificarToken } = require('../controllers/authController');

router.post('/completar', verificarToken, completarVenta);
router.get('/historial', verificarToken, obtenerHistorial); // Nueva ruta

module.exports = router;