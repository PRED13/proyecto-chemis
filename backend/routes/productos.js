// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen_url, p.stock, c.nombre AS categoria 
                FROM Productos p
                JOIN Categorias c ON p.categoria_id = c.id
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: "Error al obtener productos", error: err.message });
    }
});

module.exports = router;