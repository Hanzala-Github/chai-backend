import { app } from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
dotenv.config({ path: "./env" });

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error`, error);
    });

    // listening on port
    app.listen(process.env.PORT || 8000, () => {
      console.log(`* Server is runung on port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed !!! ", error);
  });
