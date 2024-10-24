import dotenv from "dotenv";
import { app } from "./app";

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

main()
  .then(() => {
    console.info("App started");
  })
  .catch((err) => {
    console.error("App failed");
    console.error(err.stack);
  });
