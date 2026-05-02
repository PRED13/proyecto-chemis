const jwt = require('jsonwebtoken');

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
        req.usuario = decoded; // Contiene id, nombre, correo
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido o expirado.' 
        });
    }
};
const esAdmin = (req, res, next) => {
    // El objeto req.usuario fue inyectado previamente por verificarToken
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso restringido: Se requieren permisos de administrador.' 
        });
    }
};

module.exports = { verificarToken, esAdmin};