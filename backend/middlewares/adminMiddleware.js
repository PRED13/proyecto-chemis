const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            mensaje: "Acceso denegado: Se requieren privilegios de administrador." 
        });
    }
};

module.exports = adminMiddleware; // Exportación directa