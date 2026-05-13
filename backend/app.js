const express = require('express');
const cors = require('cors');
const path = require('path');
const { poolPromise } = require('./config/db');
const { verificarConexionSMTP } = require('./services/emailService');

// Importar Rutas
const ventasRoutes = require('./routes/ventasRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, '../frontend');
console.log('📁 Ruta del Frontend:', frontendPath);
app.use(express.static(frontendPath));

// Conectar Base de Datos (poolPromise ya se conecta al importar db.js)
// poolPromise ya está inicializándose en db.js

// Definición de Endpoints
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// SPA: Cualquier ruta que no sea de API ni archivo estático devuelve index.html
app.get(/^\/(?!api\/)/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Servidor de Granja Premium activo en http://localhost:${PORT}`);
    // Verificar conexión SMTP para envío de correos
    await verificarConexionSMTP();
});