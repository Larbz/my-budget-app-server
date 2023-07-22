import "dotenv/config";
import app from "./app";
import { config } from "./config/config";
import "./database";

function main() {
    if (config.ENVIRONMENT === "local") {
        app.listen(app.get("port"), () => {
            console.log(`Servidor Node.js escuchando en local`);
          });
    } else {
        app.listen(app.get("port"), app.get("my-ip"), () => {
            console.log(`Servidor Node.js escuchando en LAN`);
          });
    }
    console.log(`Server on port ${app.get("port")}`);
    console.log(config.MONGO_URL);
}
main();
