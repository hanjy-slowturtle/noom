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

let sockets = [];

wsServer.on("connection", (socket) => {
    socket["nickname"] = "anonymous";
    sockets.push(socket);
    console.log(`Connected to Browser, client count: ${sockets.length}`);

    socket.on("message", (message) => {
        const { type, payload } = JSON.parse(message);
        switch(type) {
            case "message":
                sockets.forEach((aSocket) => {
                    if(aSocket !== socket) {
                        aSocket.send(`${socket.nickname}: ${payload.toString()}`);
                    }
                });
                break;
            case "nickname":
                socket["nickname"] = payload;
                break;
        }
    });
    socket.on("close", () => {
        sockets = sockets.filter((aSocket) => (aSocket !== socket));
        console.log(`Disconnected from Browser, client count: ${sockets.length}`);
    });
});

server.listen(3000, handleListen);