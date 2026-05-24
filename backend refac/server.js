const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Inyección de Rutas Modulares (Valida que los nombres coincidan exactamente con tus archivos)
const authRoutes = require('./src/routes/auth');
const productosRoutes = require('./src/routes/productos');
const ventasRoutes = require('./src/routes/ventasRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Montaje de Endpoints (Aquí se generaba el error si alguna variable de arriba era undefined)
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/admin', adminRoutes);

// Manejo global de error 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint no encontrado en SERVER3.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
});