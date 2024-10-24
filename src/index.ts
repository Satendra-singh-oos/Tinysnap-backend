import dotenv from "dotenv";
import { app } from "./app";
import { connectDb } from "./db";

dotenv.config({
  path: "./env",
});

const main = async () => {
  app.listen(process.env.PORT || 7680, () => {
    console.log(
      `Server is up and running at port : ${process.env.PORT || 8000}`
    );
  });

  app.on("error", (error) => {
    console.log("Error: ", error);
    throw error;
  });
};

connectDb()
  .then(() => {
    // console.info("App started");
    app.listen(process.env.PORT || 7680, () => {
      console.log(
        `Server is up and running at port : ${process.env.PORT || 8000}`
      );
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
