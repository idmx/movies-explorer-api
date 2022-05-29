const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { createUser, login, logout } = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), createUser);

router.post('/signout', logout)

module.exports = router;
