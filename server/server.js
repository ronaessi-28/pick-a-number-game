const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();   
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Rooms to manage game codes and players
const rooms = {};

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('createGame', (playerName) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
            players: [{ id: socket.id, name: playerName }],
            turn: 0
        };
        socket.join(roomCode);
        socket.emit('gameCreated', roomCode);
    });
    
    socket.on('joinGame', ({ code, playerName }) => {
        if (rooms[code] && rooms[code].players.length === 1) {
            rooms[code].players.push({ id: socket.id, name: playerName });
            socket.join(code);
    
            // Notify both players
            io.to(code).emit('playerJoined');
        } else {
            socket.emit('errorMessage', 'Invalid code or room is full');
        }
    });
    

    socket.on('startGame', (roomCode) => {
        if (rooms[roomCode]) {
            const names = rooms[roomCode].players.map(p => p.name);
            io.to(roomCode).emit('startGame', names);
        }
    });
    

    socket.on('pickNumber', ({ roomCode, number }) => {
        socket.to(roomCode).emit('numberPicked', number);
    });

    socket.on('submitAnswer', ({ roomCode, answer }) => {
        socket.to(roomCode).emit('answerSubmitted', answer);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Clean up the room if needed
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            if (rooms[room].length === 0) delete rooms[room];
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
