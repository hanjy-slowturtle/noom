import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const ioServer = SocketIO(httpServer);

function getPublicRooms() {
    const {
        sockets: {
            adapter: {
                sids,
                rooms
            }
        }
    } = ioServer;

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });

    return publicRooms;
}

function countRoomUser(roomName) {
    return ioServer.sockets.adapter.rooms.get(roomName)?.size;
}

ioServer.on("connection", (socket) => {
    socket.emit("room_change", getPublicRooms());

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on(
        "enter_room",
        (roomName, nickname, done) => {
            socket.join(roomName);
            socket["nickname"] = nickname;
            done(countRoomUser(roomName));
            socket.to(roomName).emit(
                "welcome",
                socket.nickname,
                countRoomUser(roomName)
            );
            ioServer.sockets.emit("room_change", getPublicRooms());
        }
    );
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => {
            socket.to(room).emit(
                "bye",
                socket.nickname,
                countRoomUser(room) - 1
            );
        });
    });
    socket.on("disconnect", () => {
        ioServer.sockets.emit("room_change", getPublicRooms());
    });
    socket.on("new_message", (msg, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
});

// const wsServer = new WebSocket.Server({ server });

// let sockets = [];

// wsServer.on("connection", (socket) => {
//     socket["nickname"] = "anonymous";
//     sockets.push(socket);
//     console.log(`Connected to Browser, client count: ${sockets.length}`);

//     socket.on("message", (message) => {
//         const { type, payload } = JSON.parse(message);
//         switch(type) {
//             case "message":
//                 sockets.forEach((aSocket) => {
//                     if(aSocket !== socket) {
//                         aSocket.send(`${socket.nickname}: ${payload.toString()}`);
//                     }
//                 });
//                 break;
//             case "nickname":
//                 socket["nickname"] = payload;
//                 break;
//         }
//     });
//     socket.on("close", () => {
//         sockets = sockets.filter((aSocket) => (aSocket !== socket));
//         console.log(`Disconnected from Browser, client count: ${sockets.length}`);
//     });
// });

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);