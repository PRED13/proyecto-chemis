// backend/index.js (Actualizado)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const productosRoutes = require('./routes/productos');

// Middlewares
app.use(cors());
app.use(express.json());

// Uso de rutas
app.use('/api/productos', productosRoutes);

app.get('/', (req, res) => {
    res.send('Servidor de Granja Premium funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});