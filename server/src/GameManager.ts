import { TOGGLE_READY } from './../../shared/client-events';
import SocketServer from 'socket.io';

import { Player, NewPlayer } from './Player';
import { Game } from './Game';

import {
  NEW_PLAYER,
  JOIN_GAME,
  NEW_GAME,
  LEAVE_GAME,
} from '../../shared/client-events';

import { JOINED_GAME, PLAYERS_DATA } from '../../shared/server-events';

import { GamesDataPayload, GameStages } from '../../shared/types';

interface Idisconnections {
  [pId: string]: NodeJS.Timeout;
}

const _disconnections: Idisconnections = {};
const RECONNECTION_TIME_LIMIT: number = 10000;

function playerBySocket(socketId: string | null) {
  return Object.values(Player.Players).find((p: Player) => {
    return p.socketId === socketId;
  });
}

function gameByPlayer(id: string) {
  return Object.values(Game.Games).find((g: Game) => g.players[id]);
}

export const addSocketEvents = (server: any) => {
  const io = SocketServer(server, {
    path: '/socket',
  });

  Game.io = io;

  function updatePlayers() {
    io.emit(
      PLAYERS_DATA,
      Object.values(Player.Players).map((p: Player) => {
        return p.name;
      })
    );
  }

  io.on('connection', function(socket) {
    Game.updateGames(socket);

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
      const p = playerBySocket(socket.id);

      if (!p) {
        return;
      }

      const game = gameByPlayer(p.id);

      if (game) {
        const timerID = setTimeout(() => {
          console.log(`player ${p.id} was disconnected from game`);

          game.removePlayerFromGame(p.id);

          delete _disconnections[p.id];
          delete Player.Players[p.id];
        }, RECONNECTION_TIME_LIMIT);

        _disconnections[p.id] = timerID;
        game.addDisconnectedPlayer(p.id);
      }

      updatePlayers();
    });

    socket.on(NEW_GAME, () => {
      const p = playerBySocket(socket.id);
      if (!p) {
        return;
      }

      const game = new Game(io, p, socket);

      Game.Games[game.id] = game;

      socket.emit(JOINED_GAME, game.id);
    });

    socket.on(JOIN_GAME, id => {
      const game = Game.Games[id];
      const player = playerBySocket(socket.id);

      if (!game || !player || game.gameStage !== GameStages.LOBBY) {
        return;
      }

      game.addPlayer(player.id, socket);
      socket.emit(JOINED_GAME, game.id);
    });

    socket.on(LEAVE_GAME, id => {
      const game = Game.Games[id];
      const player = playerBySocket(socket.id);

      if (!game || !player) {
        return;
      }

      game.removePlayerFromGame(player.id);
    });

    socket.on(TOGGLE_READY, id => {
      const game = Game.Games[id];
      const player = playerBySocket(socket.id);

      if (!game || !player) {
        return;
      }

      game.togglePlayerReady(player.id);
    });
  });
};
