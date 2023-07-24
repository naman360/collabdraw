const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 5002;

io.on("connection", (socket) => {
    console.log("User Online");

    socket.on("canvas-data", (data) => {
        socket.broadcast.emit("canvas-data", data);
    });
});

httpServer.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});
