const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { verificarToken } = require('../controllers/authController');
const adminMiddleware = require('../middlewares/adminMiddleware');

// LOG DE DEPURACIÓN: Si ves un "false" en la consola, el archivo no se cargó bien.
console.log("Carga de Middleware Admin:", typeof adminMiddleware === 'function');

// Ruta para actualizar stock (Línea 15 aprox)
// Usamos adminMiddleware porque así se llama la constante arriba
router.put('/stock', verificarToken, adminMiddleware, productosController.actualizarStock);

// Ruta para crear producto
router.post('/', verificarToken, adminMiddleware, productosController.crearProducto);

module.exports = router;