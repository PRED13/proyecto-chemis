const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db');

// Importar Rutas
const ventasRoutes = require('./routes/ventasRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const authRoutes = require('./routes/authRoutes'); // Si ya lo tienes creado

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('🚀 El Backend de Granja Premium está operando correctamente.');
});

// Conectar Base de Datos (poolPromise ya se conecta al importar db.js)
// poolPromise ya está inicializándose en db.js

// Definición de Endpoints
app.use('/api/ventas', ventasRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Granja Premium activo en http://localhost:${PORT}`);
});