// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/db');

// Registro de usuario
const registrarUsuario = async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const pool = await poolPromise;
        const existingUser = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT id FROM Usuarios WHERE correo = @correo');

        if (existingUser.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('correo', sql.VarChar, correo)
            .input('pass', sql.VarChar, hashedPassword)
            .query('INSERT INTO Usuarios (nombre, correo, password) VALUES (@nombre, @correo, @pass)');

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente'
        });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
};

// Login de usuario
const iniciarSesion = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT id, nombre, correo, password, rol FROM Usuarios WHERE correo = @correo');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol || 'cliente'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol || 'cliente'
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

// Verificar token (middleware)
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion,
    verificarToken
};