// backend/db.js
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: '127.0.0.1', // Forzamos IPv4
    port: 1433,          // Forzamos el puerto manualmente
    database: process.env.DB_NAME,
    options: {
        encrypt: false,             // Desactiva si es local (evita errores de certificados)
        trustServerCertificate: true // Confía en el certificado local
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server con éxito');
        return pool;
    })
    .catch(err => console.log('Fallo en la conexión a la base de datos: ', err));

module.exports = {
    sql, poolPromise
};