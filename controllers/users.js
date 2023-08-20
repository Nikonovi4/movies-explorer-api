const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Пользователь не найден'));
      }
      return bcrypt.compare(password, user.password, (err, isPasswordMatch) => {
        if (!isPasswordMatch) {
          return next(new UnauthorizedError('Неправильные логин или пароль'));
        }
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
          expiresIn: '7d',
        });
        res.cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });
        return res.status(200).send({ user });
      });
    })
    .catch((err) => next(err));
};

const userCreate = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => User.create({ name, email, password: hash })
    .then((user) => res.status(201).send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            `Возникли ошибки валидации: ${Object.values(err.errors)
              .map((error) => error.message)
              .join(', ')}`,
          ),
        );
      }
      if (err.code === 11000) {
        return next(new ConflictError('Данная почта уже зарегестрирована'));
      }
      return next(err);
    }));
};

const getUserInfo = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id).then((user) => {
    if (user === null) {
      next(new NotFoundError('Пользователь по данному _id не найден'));
    } else {
      res.status(200).send(user);
    }
  })
    .catch((err) => next(err));
};

const updateUserById = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
    },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при обновлении профиля.',
          ),
        );
      }
      if (err.code === 11000) {
        return next(new ConflictError('Данная почта уже зарегестрирована'));
      }
      return next(err);
    });
};

const logout = (req, res, next) => {
  res.clearCookie('jwt').status(202).send('user is logout')
    .catch((err) => next(err));
};

module.exports = {
  userCreate,
  updateUserById,
  getUserInfo,
  login,
  logout,
};
