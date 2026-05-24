const { poolPromise, sql } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function crearAdmin() {
    try {
        const pool = await poolPromise;
        const correoAdmin = 'novaexplorer99@gmail.com';
        const clavePlana = 'Admin123*';

        // 1. Encriptar la contraseña de forma nativa en tu entorno
        console.log('⏳ Generando hash seguro para la contraseña...');
        const hashedPassword = await bcrypt.hash(clavePlana, 10);

        // 2. Limpiar cualquier registro previo del correo para evitar duplicados
        await pool.request()
            .input('correo', sql.VarChar, correoAdmin)
            .query('DELETE FROM Usuarios WHERE correo = @correo');

        // 3. Insertar el usuario administrador con el hash exacto generado por tu Node.js
        await pool.request()
            .input('nombre', sql.VarChar, 'Juan Carlos Admin')
            .input('correo', sql.VarChar, correoAdmin)
            .input('password', sql.VarChar, hashedPassword)
            .input('rol', sql.VarChar, 'admin')
            .query('INSERT INTO Usuarios (nombre, correo, password, rol) VALUES (@nombre, @correo, @password, @rol)');

        console.log('\n======================================================');
        console.log('✅ ¡ADMINISTRADOR ACTUALIZADO CON ÉXITO EN SERVER3!');
        console.log(`📧 Correo: ${correoAdmin}`);
        console.log(`🔑 Contraseña: ${clavePlana}`);
        console.log(`🔒 Hash guardado: ${hashedPassword}`);
        console.log('======================================================');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inyectando el administrador:', error.message);
        process.exit(1);
    }
}

crearAdmin();