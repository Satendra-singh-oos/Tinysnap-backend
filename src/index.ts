import dotenv from "dotenv";
import { app } from "./app";
import { connectDb } from "./db";
import { env } from "process";

dotenv.config({
  path: "./env",
});

const main = async () => {
  app.listen(env.PORT || 7680, () => {
    console.log(`Server is up and running at port : ${env.PORT || 8000}`);
  });

  app.on("error", (error) => {
    console.log("Error: ", error);
    throw error;
  });
};

connectDb()
  .then(() => {
    // console.info("App started");
    app.listen(env.PORT || 7680, () => {
      console.log(`⚙️  Server is up and running at port : ${env.PORT || 8000}`);
    });

    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
  })
  .catch((err) => {
    console.error("App failed");
    console.error(err.stack);
  });
