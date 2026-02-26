import express from "express";
import "dotenv/config";
import * as Sentry from "@sentry/node";

import loginRouter from "./routes/login.js";
import usersRouter from "./routes/users.js";
import hostsRouter from "./routes/hosts.js";
import propertiesRouter from "./routes/properties.js";
import bookingsRouter from "./routes/bookings.js";
import reviewsRouter from "./routes/reviews.js";

import logMiddleware from "./middleware/logMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Sentry (required by assignment)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// JSON body parsing (required)
app.use(express.json());

// Duration logging (required)
app.use(logMiddleware);

// Root route
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// Mount routes
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/hosts", hostsRouter);
app.use("/properties", propertiesRouter);
app.use("/bookings", bookingsRouter);
app.use("/reviews", reviewsRouter);

// Sentry error handler (must be before your error handler)
app.use(Sentry.Handlers.errorHandler());

// Global error handler (required)
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});