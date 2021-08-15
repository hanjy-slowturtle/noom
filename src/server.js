import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

const sockets = [];

wsServer.on("connection", (socket) => {
    console.log("Connected to Browser");
    sockets.push(socket);

    socket.on("message", (message) => {
        sockets.forEach((aSocket) => {
            aSocket.send(message.toString());
        });
    });
    socket.on("close", () => {
        console.log("Disconnected from Browser");
    });
});

server.listen(3000, handleListen);