const adminMiddleware = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren privilegios de Administrador.' });
    }
    next();
};

module.exports = adminMiddleware; // <-- Exportación limpia de la función