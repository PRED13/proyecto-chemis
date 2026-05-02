const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, mensaje: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // IMPORTANTE: Usa 'user' para que coincida con tu adminMiddleware
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, mensaje: "Token inválido o expirado" });
    }
};

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. No se proporcionó un token.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
        req.user = decoded; // Contiene id, nombre, correo - NORMALIZADO A req.user
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token inválido o expirado.'
        });
    }
};
const esAdmin = (req, res, next) => {
    // El objeto req.user fue inyectado previamente por verificarToken o authMiddleware
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Acceso restringido: Se requieren permisos de administrador.'
        });
    }
};

module.exports = { authMiddleware, verificarToken, esAdmin };