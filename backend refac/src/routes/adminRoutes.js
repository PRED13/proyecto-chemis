const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

console.log("--- DEBUG DE CONTROLADOR ---");
console.log("Tipo de productosController:", typeof productosController);
console.log("Es 'crear' una función?:", typeof productosController.crear);
console.log("--- FIN DEBUG ---");

// Importaciones de seguridad
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Si sospechas que tus middlewares fallan, puedes comentar temporalmente estas dos líneas 
// para validar que levante el servidor, pero recuerda activarlas después:
router.use(authMiddleware);
router.use(adminMiddleware);

// Endpoints CRUD del Administrador
router.get('/inventario', productosController.obtenerTodos);

// Línea 17: Ahora productosController.crear SÍ existirá como función válida
router.post('/productos', productosController.crear);              
router.put('/productos/:id', productosController.editar);           
router.delete('/productos/:id', productosController.eliminar);       

module.exports = router;