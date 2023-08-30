const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { errors } = require("celebrate");
const helmet = require("helmet");
const errorHandler = require("./middlewares/error-handler");
require("dotenv").config();
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const routes = require("./routes/index");

app.use(cors({ origin: ["https://nikonovi4.nomoredomainsicu.ru", "http://localhost:3000"], credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(requestLogger);

const { PORT = 4000, DB_URL = "mongodb://0.0.0.0/bitfilmsdb" } = process.env;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to bd");
  });

app.use(cookieParser());
app.use(bodyParser.json());
app.use(routes);
app.use(errors());
app.use(errorHandler);
app.use(errorLogger);

app.listen(PORT, () => {
  console.log(`server is runing on port ${PORT}`);
});
