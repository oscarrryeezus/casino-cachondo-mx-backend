const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = auth;
