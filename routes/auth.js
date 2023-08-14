const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  userCreate,
  login,
  logout,
} = require('../controllers/users');

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(5),
    }),
  }),
  userCreate,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(5),
    }),
  }),
  login,
);

router.delete('/signout', logout);

module.exports = router;
