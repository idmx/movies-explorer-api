const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/AuthorizationError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const authorization = req.cookies.jwt;
  if (!authorization) {
    throw new AuthorizationError('Необходима авторизация');
  }

  let payload;

  try {
    payload = jwt.verify(authorization, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    throw new AuthorizationError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
