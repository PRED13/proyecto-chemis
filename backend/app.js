const express = require('express');
const cors = require('cors');
const { conectarDB } = require('./config/db');

// Importar Rutas
const ventasRoutes = require('./routes/ventasRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const authRoutes = require('./routes/authRoutes'); // Si ya lo tienes creado

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar Base de Datos
conectarDB();

// Definición de Endpoints
app.use('/api/ventas', ventasRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Granja Premium activo en http://localhost:${PORT}`);
});