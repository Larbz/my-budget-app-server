import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Application, json } from "express";
import fileUpload from "express-fileupload";
import morgan, { Options } from "morgan";
import authRoutes from "./routes/auth";
import categorieRoutes from "./routes/categories";
import imageRoutes from "./routes/image";
import transactionRoutes from "./routes/transactions";
const app: Application = express();
//settings
app.set("port", process.env.PORT);

//middlewares
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:3000", "http://localhost:5173"],
        optionsSuccessStatus: 200,
        exposedHeaders: ["Authorization", "CSRF"],
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    })
);
// app.use({ credentials: true });
//routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/images", imageRoutes);

export default app;
