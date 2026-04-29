const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../db');

// --- REGISTRO ---
router.post('/register', async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;

        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('correo', sql.VarChar, correo)
            .input('pass', sql.VarChar, hashedPassword)
            .query('INSERT INTO Usuarios (nombre, correo, password) VALUES (@nombre, @correo, @pass)');
        
        res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al registrar (el correo podría ya existir)' });
    }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        // Generar JWT (Expiración en 2 horas)
        const token = jwt.sign(
            { id: user.id, nombre: user.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, nombre: user.nombre }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;