import mongoose, { ConnectOptions } from "mongoose";

mongoose
    .connect(
        process.env.MONGO_URL as string,
        {
            useNewUrlParser: true,
        } as ConnectOptions
    )
    .then((db) => console.log("database connected"))
    .catch((error) => console.log(error));
