const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/completar', authMiddleware, ventasController.completarVenta);
router.get('/historial', authMiddleware, ventasController.obtenerHistorial);

module.exports = router;