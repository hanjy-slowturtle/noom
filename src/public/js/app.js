const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("input");
    const message = input.value;
    socket.emit(
        "new_message",
        message,
        roomName,
        () => {
            addMessage(`You: ${message}`);
        }
    );
    input.value = "";
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const inputRoomName = form.querySelector("#roomName");
    const inputNickname = form.querySelector("#nickname");
    roomName = inputRoomName.value;
    const nickname = inputNickname.value;
    socket.emit(
        "enter_room",
        roomName,
        nickname,
        showRoom
    );
    inputRoomName.value = "";
    inputNickname.value = "";
}

form.addEventListener("submit", handleRoomSubmit);


socket.on("welcome", (nickname) => {
    addMessage(`${nickname} joined!`);
});

socket.on("bye", (nickname) => {
    addMessage(`${nickname} left.`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    console.log(rooms);
    const roomCount = welcome.querySelector("span");
    roomCount.innerText = rooms.length;
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});