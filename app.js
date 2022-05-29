const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { errors, Joi, celebrate } = require('celebrate');
const { login, createUser, logout } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const NotFoundError = require('./errors/NotFoundError');
const usersRoute = require('./routes/users');
const moviesRoute = require('./routes/movies');
const signRoute = require('./routes/sign');

const { PORT = 3001, DATA_BASE, NODE_ENV } = process.env;
const app = express();

app.use(cookieParser());

mongoose.connect(NODE_ENV === 'production' ? DATA_BASE : 'mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(cors);

app.use(signRoute);

app.use(auth);

app.use(usersRoute);
app.use(moviesRoute);

app.use('*', (req, res, next) => next(new NotFoundError('Страница не найдена')));

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка.' : message,
  });
  next();
});

app.listen(PORT, () => {});
