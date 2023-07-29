const router = require('express').Router();
const authRouter = require('./auth');
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');

router.use('/', authRouter);
router.use(auth);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

module.exports = router;
