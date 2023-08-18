const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000"],
    },
});
const port = process.env.PORT || 5002;

io.on("connection", (socket) => {
    console.log("User Online");

    socket.on("canvas-data", (data) => {
        socket.broadcast.emit("canvas-data", data);
    });
    socket.on("mouse-up", (data) => {
        socket.broadcast.emit("mouse-up", data);
    });
});

httpServer.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});
