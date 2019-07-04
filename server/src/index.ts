import express from "express";
import { createServer } from "http";
import socketio, { Socket } from "socket.io";
import path from "path";
import { Player, NewPlayer } from "./Player";
import { Game } from "./Game";

const app = express();
const server = createServer(app);
const io = socketio(server);

interface Idisconnections {
  [pId: string]: NodeJS.Timeout
};

const _disconnections: Idisconnections = {};

function updatePlayers() {
  io.emit(
    "players",
    Object.values(Player.Players).map((p: Player) => {
      return p.name;
    })
  );
}

function updateGames() {
  io.emit(
    "games",
    Object.values(Game.Games).map((g: Game) => {
      return g.id;
    })
  );
}

function playerBySocket(socketId: string | null) {
  return Object.values(Player.Players).find((p: Player) => {
    return p.socketId === socketId;
  });
}

function gameByPlayer(id: string) {
  return Object.values(Game.Games).find((g: Game) => g.players.has(id));
}

app.use("/client", express.static(path.resolve(__dirname, "../../client")));

app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../client/index.html"));
});

io.on("connection", function(socket) {
  updateGames();

  socket.on("new-player", (p: NewPlayer) => {
    Player.Players[p.id] = new Player(socket, p);
    const game = gameByPlayer(p.id);

    if (game) {
      game.addPlayer(p.id, socket);
      socket.emit("joined-game", game.id);
    }

    if (_disconnections[p.id]) {
      console.log(`player ${p.id} has reconnected back`);

      clearTimeout(_disconnections[p.id]);
      delete _disconnections[p.id];
      
      game.removeDisconnectedPlayer(p.id);
    } else {
      console.log(`new playered with id ${p.id} joined the game!`);
    }

    updatePlayers();
  });

  socket.on("disconnect", () => {
    // onPlayerDisconnect
    const p = playerBySocket(socket.id);

    if (!p) {
      return;
    }
    
    const game = gameByPlayer(p.id);
    
    const timerID = setTimeout(() => {
      console.log(`player ${p.id} was disconnected from game`);

      clearTimeout(_disconnections[p.id]);
      delete _disconnections[p.id];

      game.removePlayerFromGame(p.id);
    }, 10000);
    
    _disconnections[p.id] = timerID;
    game.addDisconnectedPlayer(p.id);

    delete Player.Players[p.id];
    updatePlayers();
  });

  socket.on("new-game", () => {
    const p = playerBySocket(socket.id);
    if (!p) {
      return;
    }

    const game = new Game(io, p, socket);

    Game.Games[game.id] = game;

    updateGames();

    socket.emit("joined-game", game.id);
  });

  socket.on("join-game", (id) => {
    const game = Game.Games[id];
    const player = playerBySocket(socket.id);

    if (!game || !player) {
      return;
    }

    game.addPlayer(player.id, socket);
    socket.emit("joined-game", game.id);
  });
});

server.listen(3334, () => {
  console.log(`server is running http://localhost:${3334}`);
});
