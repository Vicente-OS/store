const jwt = require('jsonwebtoken');

const SECRET_KEY = 'super-secret-key-change-this-in-production';

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.clearCookie('token').redirect('/login');
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).send('Forbidden: Access denied');
        }
    };
};

module.exports = { verifyToken, requireRole, SECRET_KEY };
