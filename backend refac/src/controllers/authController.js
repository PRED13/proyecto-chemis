const { poolPromise, sql } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // <-- Inyección de la librería de encriptación

// Constante para el costo del procesamiento del hash (Estándar de la industria)
const SALT_ROUNDS = 10;

exports.registrar = async (req, res) => {
    const { nombre, correo, password } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Validar si el correo ya existe en SERVER3
        const userCheck = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT id FROM Usuarios WHERE correo = @correo');
            
        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo ya se encuentra registrado.' });
        }

        // 2. Encriptar la contraseña antes de mandarla a la base de datos
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. Insertar nuevo usuario con su respectivo hash seguro
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('correo', sql.VarChar, correo)
            .input('password', sql.VarChar, hashedPassword) // <-- Hash seguro almacenado
            .input('rol', sql.VarChar, 'cliente')
            .query('INSERT INTO Usuarios (nombre, correo, password, rol) VALUES (@nombre, @correo, @password, @rol)');

        // 4. Recuperar el usuario recién creado para firmar su sesión automática
        const newUser = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT id, nombre, correo, rol FROM Usuarios WHERE correo = @correo');

        const usuario = newUser.recordset[0];
        const token = jwt.sign(
            { id: usuario.id, correo: usuario.correo, rol: usuario.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.status(201).json({ success: true, token, usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    const { correo, password } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Buscar al usuario por correo electrónico
        const result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT id, nombre, correo, password, rol FROM Usuarios WHERE correo = @correo');

        // 2. Si el usuario no existe, cortamos el flujo inmediatamente
        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        const usuario = result.recordset[0];

        // 3. Comparar la contraseña en texto plano con el Hash almacenado en la BD
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecto) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // 4. Emitir el Token de acceso seguro si las credenciales coinciden
        const token = jwt.sign(
            { id: usuario.id, correo: usuario.correo, rol: usuario.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.json({ 
            success: true, 
            token, 
            usuario: { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                correo: usuario.correo, 
                rol: usuario.rol 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};