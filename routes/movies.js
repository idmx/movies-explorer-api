const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
const validator = require('validator');

router.get('/movies', getMovies);
router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom((value, helpers) => {
      return validator.isURL(value) ? value : helpers.message('Некорректная ссылка')
    }),
    trailerLink: Joi.string().required().custom((value, helpers) => {
      return validator.isURL(value) ? value : helpers.message('Некорректная ссылка')
    }),
    thumbnail: Joi.string().required().custom((value, helpers) => {
      return validator.isURL(value) ? value : helpers.message('Некорректная ссылка')
    }),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);
router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().length(24).hex(),
  }),
}), deleteMovie);

module.exports = router;
