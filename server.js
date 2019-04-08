var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
io.set('transports', ['websocket']);
var players = {};
var helmet = {
    x: Math.floor(Math.random() * 1500) + 50,
    y: Math.floor(Math.random() * 900) + 50
};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected: ', socket.id);
    // create a new player and add it to our players object
    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        movementDirection:'',
        currentScore:0
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // send the star object to the new player
    socket.emit('helmetLocation', helmet);
    // send the current scores
    socket.emit('scoreUpdate', players[socket.id]);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected: ', socket.id);
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].movementDirection = movementData.movement;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
    socket.on('helmetCollected', function () {
        players[socket.id].currentScore+=100;
        helmet.x = Math.floor(Math.random() * 700) + 50;
        helmet.y = Math.floor(Math.random() * 500) + 50;
        io.emit('helmetLocation', helmet);
        io.emit('scoreUpdate',  players[socket.id]);
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

