import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { initSocket } from "./utils/socket.io.js";

dotenv.config(
    {
        path: "./env",
    }
)

connectDB().then(
    () => {
        const server = http.createServer(app); // for the app server
        initSocket(server); // socket io server
        //listining
        server.listen(process.env.PORT || 8000, () => {
            console.log(`server is listning on port: ${process.env.PORT}`);
        })
        server.on("error", (error) => {
            console.log("Error while starting the server:", error);
        });
    }
).catch(
    (err) => {
        console.log("error while connecting DB: ", err);
    }
)