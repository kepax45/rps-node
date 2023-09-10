document.getElementById("linktext").href = window.location;
document.getElementById("linktext").innerHTML = window.location;
function getLocationOrigin() {
    splitted = window.location.origin.split(":")
    return splitted[0]+":"+splitted[1];
}
const socket = io(getLocationOrigin()+":3000");
socket.on("connect", () => {
    console.log("Connected to server!");
    socket.emit('data', window.location.pathname.split('/')[2]);
});
let id = "";
socket.on('id', (data) => {
    id = data.id;
})
socket.on("game-started", (data) => {
    console.log("Your id is: " + id);
    document.getElementById("link").style.visibility = "hidden";
    document.getElementById("header").innerHTML = "All players connected!"
    document.getElementById("results").style.visibility = "visible";
    document.getElementById("ldr").style.display = "flex";
    document.getElementById("tick").style.display = "none";
    document.getElementById("tick").src = "../../assets/success-tick2.svg";
    const choiceElements = document.getElementsByClassName("choices");
    for (const element of choiceElements) {
        element.style.visibility = "visible";
    }
    const choiceBtnElements = document.getElementsByClassName("choicebtn");
    for (const element of choiceBtnElements) {
        element.style.visibility = "visible";
    }
    const Op_choiceBtnElements = document.getElementsByClassName("op_choicebtn");
    for (const element of Op_choiceBtnElements) {
        element.style.visibility = "visible";
    }
    document.getElementById("paper1").src = "../../assets/paper.svg";
});
document.getElementById("game-over-btn").addEventListener("click", () => {
    window.location = window.location.origin;
})
socket.on("game-aborted", (data) => {
    document.getElementById("header").innerHTML = "You won!";
    document.getElementById("results").innerHTML = "The opponent left the game.";
    document.getElementById("tick").style.display = "none";
    document.getElementById("ldr").style.display = "none";
    const choiceBtnElements = document.getElementsByClassName("choicebtn");
    for (const element of choiceBtnElements) {
        element.style.display = "none";
    }
});
let move = "";
const choiceButtons = document.getElementsByClassName("choicebtn")
for(const element of choiceButtons) {
    element.addEventListener("click", () => {
        socket.emit('move-played', {id: id, move: element.alt, game: window.location.pathname.split('/')[2]});
    });
};
socket.on('game-results', (data) => {
    results = data;
    console.log(results);
    local = results.find(obj => obj.id === id);
    opponent = results.find(obj => obj.id !== id);
    opponent_move = opponent.move;
    opponent_points = opponent.points;
    local_move = local.move;
    local_points = local.points;
    document.getElementById("rock1").style.visibility = "hidden";
    document.getElementById("scissors1").style.visibility = "hidden";
    document.getElementById("paper1").src = "../../assets/"+local_move.toLowerCase()+".svg";
    document.getElementById("ldr").style.display = "none";
    document.getElementById("tick").style.display = "flex";
    document.getElementById("tick").src = "../../assets/"+opponent_move.toLowerCase()+".svg";
    document.getElementById("tick").style.width = document.getElementById("paper1").style.width;
    document.getElementById("tick").style.height = document.getElementById("paper1").style.height;
    document.getElementById("results").innerHTML = local_points + " - " + opponent_points;
});
socket.on('opponent-chose', (data) => {
    if(data.id !== id) {
        document.getElementById("ldr").style.display = "none";
        document.getElementById("tick").style.display = "flex";
    }
});
socket.on('game-over', (data) => {
    result = data.find(obj => obj.id === id).result;
    document.getElementById("header").innerHTML = result;
    document.getElementById("game-over-btn").style.display = "block";
})