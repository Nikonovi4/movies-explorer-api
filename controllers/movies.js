const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const Forbidden = require('../errors/forbidden');
const ConflictError = require('../errors/conflict-error');

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Проверьте правилность заполнения'));
      }
      // if (err.code === 11000) {
      //   return next(new ConflictError('Такой фильм уже добавлен'));
      // }
      return next(err);
    });
};

const getMovies = (req, res, next) => {
  const { _id } = req.user;

  Movie.find({ owner: _id }).then((movies) => {
    if (movies === null) {
      return next(new NotFoundError('Фильмы не найдены'));
    }
    return res.status(200).send(movies);
  })
    .catch((err) => next(err));
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;

  Movie.findById({ _id: movieId }).then((movie) => {
    if (movie === null) {
      return next(new NotFoundError('Фильм не найден'));
    }
    if (movie.owner.toString() !== _id) {
      return next(new Forbidden('Недостаточно прав для удаления фильма'));
    }
    return Movie.deleteOne(movie)
      .then(() => res.status(200).send(movie));
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new NotFoundError('Фильм не найден'));
      }
      return next(err);
    });
};

module.exports = {
  createMovie,
  getMovies,
  deleteMovie,
};
