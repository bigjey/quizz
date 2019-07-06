import express from 'express';
import { createServer } from 'http';
import socketio, { Socket } from 'socket.io';
import path from 'path';
import { Player, NewPlayer } from './Player';
import { Game } from './Game';

import { NEW_PLAYER, JOIN_GAME, NEW_GAME } from '../../shared/client-events';
import {
  JOINED_GAME,
  GAMES_DATA,
  PLAYERS_DATA,
} from '../../shared/server-events';

interface Idisconnections {
  [pId: string]: NodeJS.Timeout;
}

const app = express();
const server = createServer(app);
const io = socketio(server);
const _disconnections: Idisconnections = {};
const RECONNECTION_TIME_LIMIT: number = 10000;

function updatePlayers() {
  io.emit(
    PLAYERS_DATA,
    Object.values(Player.Players).map((p: Player) => {
      return p.name;
    })
  );
}

function updateGames() {
  io.emit(
    GAMES_DATA,
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

app.use('/', express.static(path.resolve(__dirname, '../../client/dist')));

app.use('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
});

io.on('connection', function(socket) {
  updateGames();

  socket.on(NEW_PLAYER, (p: NewPlayer) => {
    Player.Players[p.id] = new Player(socket, p);
    const game = gameByPlayer(p.id);

    if (game) {
      game.addPlayer(p.id, socket);
      socket.emit(JOINED_GAME, game.id);
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

  socket.on('disconnect', () => {
    // onPlayerDisconnect
    const p = playerBySocket(socket.id);

    if (!p) {
      return;
    }

    const game = gameByPlayer(p.id);

    if (game) {
      const timerID = setTimeout(() => {
        console.log(`player ${p.id} was disconnected from game`);

        delete _disconnections[p.id];
        game.removePlayerFromGame(p.id);
      }, RECONNECTION_TIME_LIMIT);

      _disconnections[p.id] = timerID;
      game.addDisconnectedPlayer(p.id);
    }

    delete Player.Players[p.id];
    updatePlayers();
  });

  socket.on(NEW_GAME, () => {
    const p = playerBySocket(socket.id);
    if (!p) {
      return;
    }

    const game = new Game(io, p, socket);

    Game.Games[game.id] = game;

    updateGames();

    socket.emit(JOINED_GAME, game.id);
  });

  socket.on(JOIN_GAME, id => {
    const game = Game.Games[id];
    const player = playerBySocket(socket.id);

    if (!game || !player) {
      return;
    }

    game.addPlayer(player.id, socket);
    socket.emit(JOINED_GAME, game.id);
  });
});

server.listen(3334, () => {
  console.log(`server is running http://localhost:${3334}`);
});
