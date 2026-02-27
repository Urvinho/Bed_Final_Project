import express from "express";
import "dotenv/config";

import logMiddleware from "./middleware/logMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";

import loginRouter from "./routes/login.js";
import usersRouter from "./routes/users.js";
import hostsRouter from "./routes/hosts.js";
import propertiesRouter from "./routes/properties.js";
import bookingsRouter from "./routes/bookings.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();

app.use(express.json());
app.use(logMiddleware);

app.get("/", (req, res) => res.send("OK"));

app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/hosts", hostsRouter);
app.use("/properties", propertiesRouter);
app.use("/bookings", bookingsRouter);
app.use("/reviews", reviewsRouter);

// Catch-all 404 (JSON)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

app.listen(3000, () => console.log("Server is listening on port 3000"));