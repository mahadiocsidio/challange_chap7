require("dotenv").config();
const express = require("express");
const cookieParser = require('cookie-parser');
const Sentry = require("@sentry/node");
const pageRouter = require("./routes/page.routes");
const { resetDb } = require("./controllers/auth.controllers");
// const userRouter = require("./routers/user.routes");
const { PORT, SENTRY_DSN } = process.env;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());

app.use(Sentry.Handlers.tracingHandler());

// const server = require("http").createServer(app);
// const io = require("./socket")(server);

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });
app.use("/", pageRouter);
app.use('/resetdb', resetDb)
// app.use("/api", userRouter);

app.use(Sentry.Handlers.errorHandler());
// app.use(notFoundHandler);
// app.use(internalServerErrorHandler);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));