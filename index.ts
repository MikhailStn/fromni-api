import express from "express";
import config from "config";
import { router } from "./routes/auth.routes.js";
import mongoose from "mongoose";
import { cors } from "./middleware/cors.middleware.js";

const app = express();
const PORT = config.get("serverPort");

app.use(cors);
app.use(express.json());
app.use("/", router);

const start = async () => {
  try {
    await mongoose.connect(config.get("dbUrl"));
    app.listen(PORT, () => {
      console.log("Server started on port ", PORT);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
