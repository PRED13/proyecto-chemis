// backend/db.js
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        instanceName: 'SERVER3', // Tu instancia activa según la imagen
        encrypt: false,          // Desactivado para desarrollo local
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Conectado a SQL Server (SERVER3) con éxito');
        return pool;
    })
    .catch(err => {
        console.log('❌ Fallo en la conexión:', err.message);
    });

module.exports = { sql, poolPromise };