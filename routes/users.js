const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateUserById,
  getUserInfo,
} = require('../controllers/users');

router.get('/me', getUserInfo);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(3).max(30),
      email: Joi.string().required().email(),
    }),
  }),
  updateUserById,
);

module.exports = router;
