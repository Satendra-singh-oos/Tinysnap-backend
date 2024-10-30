import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import requestIp from "request-ip";
import hpp from "hpp";
import corsOptions from "./middlewares/global/cors";
import helmetOptions from "./middlewares/global/helmet";
import rateLimiter from "./middlewares/global/rateLimiter";
import { V1 } from "./constant";
import passport from "passport";

const app: express.Application = express();

// all the global middleware for security and others
app.use(corsOptions()); // CORS Configuration
app.use(express.json({ limit: "20kb" })); // Parse JSON data/payload (when Content-Type is application/json)
app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Parse URL-encoded data for form data submition (when Content-Type is application/x-www-form-urlencoded)
app.use(express.static("public")); // Static file serving
app.use(cookieParser()); // Parse cookies
app.use(helmetOptions()); // Security headers
app.use(compression()); // Compress responses
app.use(requestIp.mw()); // client ip address
app.use(rateLimiter()); // Rate limiter to avoid misuse of the service and avoid cost spikes
app.use(hpp()); // Protect against HTTP Parameter Pollution

// passport for sso
app.use(passport.initialize());

// import routes

import healthcheckRouter from "./routes/healthcheck.routes";
import usersRouter from "./routes/user.routes";

app.use(`${V1}/healthcheck`, healthcheckRouter);
app.use(`${V1}/users`, usersRouter);
export { app };
