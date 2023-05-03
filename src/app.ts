import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Application, json } from "express";
import morgan, { Options } from "morgan";
import authRoutes from "./routes/auth";
import categorieRoutes from "./routes/categories";
import transactionRoutes from "./routes/transactions";
const app: Application = express();
//settings
app.set("port", process.env.PORT);

//middlewares
app.use(cors({ credentials: true, origin: ["http://localhost:3000","http://localhost:5173"], optionsSuccessStatus: 200,exposedHeaders:"Authorization"}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
// app.use({ credentials: true });
//routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categorieRoutes);

export default app;