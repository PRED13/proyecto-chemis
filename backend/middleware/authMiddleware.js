const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token.' });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next(); // Continuar a la siguiente función
    } catch (err) {
        res.status(400).json({ success: false, message: 'Token no válido' });
    }
};