express = require("express");
path = require("path")
app = express();
const { Server } = require("socket.io");
const events = require("events");
const utils = require("./public/utils.js");
const {
    generateIdString,
    calcGame,
    Game,
    Connection,
    Player,
} = utils;

games = []
connections = []
players = []

const io = new Server({
    cors: {
        origin: "*",
    }
});

io.on("connection", (socket) => {
    socket.emit('id', {id: socket.client.id});
    socket.on('data', (data) => {
        try {
        game = Game.findById(data);
        game.addPlayer(new Player(socket.client.id));
        socket.join(game.id);
        if(game.allPlayersConnected()) {
            io.to(game.id).emit('game-started', {})
        }
        new Connection(socket.client, data);
    }catch(error){}
    });
    socket.on('disconnect', () => {
        try {
            disconnection = Connection.findByClient(socket.client);
            disconnection.game.removePlayer(socket.client);
            game = disconnection.game;
            io.to(game.id).emit('game-aborted', {});
        } catch(error) {}
    });
    socket.on('move-played', (data) => {
        game = Game.findById(data.game);
        try {
        let player = Player.findById(data.id)
        if(player.move !== null) 
            return;
        game.movePlayed();
        player.move = data.move;
        if(game.isFinished()) {
            io.to(game.id).emit('game-results', calcGame(game.players));
            game.resetMoves();
            if(game.players[0].points === 3 || game.players[1].points === 3) {
                let message1 = "";
                let message2 = "";
                if(game.players[0].points === 3) {
                    message1 = "You won!"
                    message2 = "You lost!"
                }
                else {
                    message2 = "You won!"
                    message1 = "You lost!"
                }
                io.to(game.id).emit('game-over', [{id: game.players[0].id, result: message1}, {id: game.players[1].id, result: message2}]);
                game.destroy();
                return;
            }
            setTimeout(() => {io.to(game.id).emit('game-started', {});}, 1000); 
        } else {
            io.to(game.id).emit('opponent-chose', {id: data.id});
        }
    }catch(error) {}
    });
});
io.listen(3000);
console.log("Started Socket server");

const port = 80;
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile("index.html");
})
app.post("/create", (req, res) => {
    gameId = generateIdString();
    new Game(gameId);
    res.status(200).send({message: gameId});
});
app.get('/game/:gameId', (req, res) => {
    id = req.url.split("/")[2];
    const isGame = games.some(obj => obj.id === id);
    if(!isGame) {
        return res.sendFile(path.join(__dirname, 'public', 'invalid.html'));
    }
    const game = Game.findById(id);
    if(game.players_connected == 2) {
        return res.sendFile(path.join(__dirname, 'public', 'invalid.html'));
    }
    return res.sendFile(path.join(__dirname, 'public', 'game.html'));
});
app.listen(port, "192.168.1.117", () => {
    console.log("Server has started");
});
setInterval(() => {
    console.log("Connections: " + connections);
    console.log("Games: " + games);
    console.log("Players: " + players);
    for(let i = 0; i < 2; i++) {
        console.log();
    }
}, 1000)