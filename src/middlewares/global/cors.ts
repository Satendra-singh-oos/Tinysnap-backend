import cors from "cors";
import env from "../../utils/env";

const corsOptions = () => {
  return cors({
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"], // Allowed methods
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
      "X-XSRF-TOKEN",
    ], // Allowed headers
    optionsSuccessStatus: 200, // Setting the response status code
    credentials: true,
    async origin(origin, callback) {
      if (!origin) return callback(null, true); // allow requests with no origin(like mobile apps or curl requests)
      const whitelist = env.CORS_ORIGIN_URL?.split(",") || [];
      if (whitelist.indexOf(origin) !== -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin.`;
        return callback(new Error(msg), false); // Blocking the call if origin not matched
      }
      return callback(null, true);
    },
  });
};

export default corsOptions;
