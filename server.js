
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const IP = require('ip');
const io = socketIO(server, {
    maxHttpBufferSize: 1e7
});
const SocketMsgModel = require('./msg.model.js');

io.eio.pingTimeout = 120000;
io.eio.pingInterval = 120000;
rooms = new Map();
app.use(express.json())
let availablePlayer = null;

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    socket.on('find_match', () => {
        console.log(`${socket.id} find_match`);
        if (availablePlayer != null) {
            console.log(`match found with ${availablePlayer} and ${socket.id}`);
            const socketMsg = new SocketMsgModel({
                competitorSocketId: socket.id,
                yourTurn: true
            });

            const socketMsg2 = new SocketMsgModel({
                competitorSocketId: availablePlayer,
                yourTurn: false
            });


            io.to(availablePlayer).emit('found_match', socketMsg);
            io.to(socket.id).emit('found_match', socketMsg2);

            availablePlayer = null;
        } else {
            availablePlayer = socket.id;
        }
    });

    socket.on('move', (msg) => {
        console.log(`${socket.id} move ${msg}`);
        console.log(msg)
        const socketMsg = SocketMsgModel.fromJson(msg);
        console.log(socketMsg)
        socket.to(socketMsg.competitorSocketId).emit('move', msg);
    })

});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://${IP.address()}:${PORT}`);
});
