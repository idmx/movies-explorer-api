const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const AuthorizationError = require('../errors/AuthorizationError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля.');
      } else if (err.code === 11000) {
        throw new ConflictError('Вы пытаетесь изменить данные чужого аккаунта');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then((user) => {
        const newUser = user.toObject();
        delete newUser.password;
        res.send(newUser);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные при создании профиля.');
        } else if (err.code === 11000) {
          throw new ConflictError('Пользователь с таким email существует');
        } else {
          return next(err);
        }
      })
      .catch(next));
};

const cookieOptions = process.env.NODE_ENV === 'production'
  ? {
    maxAge: 3600000 * 24 * 7,
    sameSite: 'none',
    domain: '.nomoreparties.sbs',
    secure: true,
  }
  : {
    maxAge: 3600000 * 24 * 7,
    sameSite: 'none',
  };

module.exports.logout = (req, res) => {
  res.clearCookie('jwt', {...cookieOptions, maxAge: -1}).send({ message: 'Успешно' });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, cookieOptions);
      res.send({ _id: user._id });
    })
    .catch(() => {
      throw new AuthorizationError('Не правильный логин или пароль');
    })
    .catch(next);
};
