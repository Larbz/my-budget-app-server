import mongoose, { ConnectOptions } from "mongoose";
import {config} from "./config/config"
mongoose
    .connect(
        config.MONGO_URL as string,
        {
            useNewUrlParser: true,
            dbName:"my-budget-app"
        } as ConnectOptions
    )
    .then((db) => console.log("database connected"))
    .catch((error) => console.log(error));
