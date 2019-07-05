const socket = window.io();

let playerId;
let playerName;
let joinedGameId;

function init() {
  playerId = window.localStorage.getItem("player_id");

  if (playerId) {
    playerName = window.localStorage.getItem("player_name");

    if (playerName) {
      socket.emit("new-player", { id: playerId, name: playerName });
    }
  } else {
    playerId = Math.random()
      .toString()
      .slice(2, 10);
    window.localStorage.setItem("player_id", playerId);
  }
}

function render() {
  $(".screen").hide();

  if (playerName) {
    if (joinedGameId) {
      $("#game").show();
    } else {
      $("#games").show();
    }
  } else {
    $("#playerName").show();
  }
}

$(function() {
  $("#playerNameForm").on("submit", function(e) {
    e.preventDefault();

    const val = $("[name=playername]")
      .val()
      .trim();

    if (val.length) {
      playerName = val;
      window.localStorage.setItem("player_name", playerName);
    }

    render();

    socket.emit("new-player", { id: playerId, name: playerName });
  });

  $("#add-game").on("click", function(e) {
    socket.emit("new-game");
  });

  $(document).on("click", "[data-join-game]", function(e) {
    const id = $(this).data("joinGame");
    if (!id) {
      return;
    }
    socket.emit("join-game", id);
  });
});

socket.on("games", (games) => {
  $("#list").html(
    games.map(
      (id) => `<div data-join-game="${id}">${id} <button>join</button></div>`
    )
  );
});

socket.on("joined-game", (gameId) => {
  joinedGameId = gameId;

  render();
});

socket.on("game-info", (game) => {
  $("#gameId").html(game.id);
  $("#gameInfo").html(JSON.stringify(game.players));
  $("#disconnectedPlayersList").html(JSON.stringify(game.disconnectedPlayers));
  $("#question").html(JSON.stringify(game.question, null, 2));
});

init();
render();
