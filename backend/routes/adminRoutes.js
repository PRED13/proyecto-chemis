const express = require('express');
const router = express.Router();
const { actualizarStock, crearProducto } = require('../controllers/productosController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { esAdmin } = require('../middlewares/adminMiddleware');

// Solo administradores pueden usar estos endpoints
router.put('/stock', verificarToken, esAdmin, actualizarStock);
router.post('/nuevo-producto', verificarToken, esAdmin, crearProducto);

module.exports = router;