import "dotenv/config";
import express, { Application, json } from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transactions"
import categorieRoutes from "./routes/categories"
const app: Application = express();
//settings
app.set("port", process.env.PORT);

//middlewares
app.use(morgan("dev"));
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories",categorieRoutes)

export default app;
