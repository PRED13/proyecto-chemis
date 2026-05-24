const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        instanceName: 'SERVER3',
        encrypt: false,
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
        console.error('❌ Fallo crítico en la conexión a la base de datos:', err.message);
        process.exit(1);
    });

module.exports = { sql, poolPromise };