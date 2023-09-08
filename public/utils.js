function generateIdString() {
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    length = 8;
    string = "";
    for(let i = 0; i < length; i++) {
        string += characters.charAt(Math.random() * characters.length);
    }
    return string;
}


function calcGame(players) {
    p1 = players[0];
    p2 = players[1];
    m1 = p1.move;
    m2 = p2.move;
    if(m1 == 'Rock' && m2 == 'Paper' || m1 == 'Scissors' && m2 == 'Rock' || m1 == 'Paper' && m2 == 'Scissors') {
        p2.points++;
    } else if(m2 == 'Rock' && m1 == 'Paper' || m2 == 'Scissors' && m1 == 'Rock' || m2 == 'Paper' && m1 == 'Scissors') {
        p1.points++;
    }
    return [p1, p2];
}

class Game {
    constructor(id) {
        this.id = id;
        this.players_connected = 0;
        this.players = []
        this.moves = 0
        games.push(this);
    }
    addPlayer(p) {
        this.players_connected++;
        this.players.push(p);
    }
    allPlayersConnected() {
        return this.players_connected == 2;
    }
    removePlayer(client) {
        this.players_connected--;
        let player_index = this.players.findIndex(obj => obj.id === client.id);
        this.players.splice(player_index, 1);
        player_index = players.findIndex(obj => obj.id === client.id);
        players.splice(player_index, 1);
        this.destroy();
    }
    destroy() {
        let index = games.findIndex(obj => obj.id === this.id);
        games.splice(index, 1);
        let c = connections.filter(obj => obj.game.id === this.id);
        for(const con of c)
            con.destroy();
        let p = this.players
        for(const pl of p)
            pl.destroy();
    }
    static findById(id) {
        return games.find(obj => obj.id === id);
    }
    movePlayed() {
        this.moves++;
    }
    isFinished() {
        return this.moves == 2;
    }
    resetMoves() {
        this.moves = 0;
        this.players[0].move = null;
        this.players[1].move = null;
    }
}
class Connection {
    static id = 0;
    constructor(client, id) {
        this.client = client;
        this.game = Game.findById(id);
        this.id = Connection.generateId();
        connections.push(this);
    }
    static generateId() {
        return generateIdString();
    }
    static findByClient(client) {
        return connections.find(obj => obj.client === client);
    }
    destroy() {
        let index = connections.findIndex(obj => obj.id === this.id);
        connections.splice(index, 1);
    }
}
class Player {
    constructor(id) {
        this.id = id;
        this.points = 0;
        this.move = null;
        players.push(this);
    }
    static findById(id) {
        return players.find(obj => obj.id === id);
    }
    destroy() {
        let index = players.findIndex(obj => obj.id === this.id);
        players.splice(index, 1);
    }
}

module.exports = {
    generateIdString,
    calcGame,
    Game,
    Connection,
    Player,
};