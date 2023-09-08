document.getElementById("create-game-btn").addEventListener("click", async () => {
    let link = "";
    const response = await fetch(window.location.origin+"/create", {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: {},
        });
        response.json().then(data => {
        window.location.replace(window.location.origin+"/game/"+data.message);
        });
});