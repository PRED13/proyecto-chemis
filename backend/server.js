// backend/server.js
const express = require('express');
const cors = require('cors');
const { poolPromise, sql } = require('./db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Permite que el frontend (puerto 5500) hable con el backend (3000)
app.use(express.json());

// Endpoint: Obtener todos los productos con su categoría
app.get('/api/productos', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen_url, p.stock, c.nombre as categoria
            FROM Productos p
            JOIN Categorias c ON p.categoria_id = c.id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ error: 'Error al obtener productos', message: err.message });
    }
});
// ... otros imports
const ventasRoutes = require('./routes/ventas');
// ... después de los otros app.use
app.use('/api/ventas', ventasRoutes);

const authRoutes = require('./routes/auth');

// ... después de tus otros middlewares
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});