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
import session from "express-session";
const app: Application = express();
//settings
app.set("port", process.env.PORT);

//middlewares
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:3000", "http://localhost:5173"],
        optionsSuccessStatus: 200,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Reemplaza con la URL de tu sitio web
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(
    session({
      secret: process.env.SECRET_KEY as string, // Clave secreta para firmar la sesión
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 86400000 // Tiempo de vida de la sesión en milisegundos (1 día)
      }    
    })
  );
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
