const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

// IMPORTACIÓN CORREGIDA: Importamos las funciones directamente sin desestructurar con {}
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Endpoint público para el catálogo
router.get('/', productosController.obtenerTodos);

// Endpoint protegido para modificar inventario (Línea 8 corregida)
router.put('/:id/stock', authMiddleware, adminMiddleware, productosController.actualizarStock);

module.exports = router;