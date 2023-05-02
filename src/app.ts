import "dotenv/config";
import express, { Application, json } from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth";

const app: Application = express();
//settings
app.set("port", process.env.PORT);

//middlewares
app.use(morgan("dev"));
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);

export default app;
