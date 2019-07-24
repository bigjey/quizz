import { PLAYER_ANSWER } from '../shared/client-events';
import { io } from './socketServer';

import { GameStages, IGameConfig } from '../shared/types';
import { JOINED_GAME, PLAYERS_DATA } from '../shared/server-events';
import {
  NEW_PLAYER,
  JOIN_GAME,
  NEW_GAME,
  LEAVE_GAME,
  TOGGLE_READY,
  CONNECTION,
  DISCONNECT,
} from '../shared/client-events';

import { Player, NewPlayer } from './Player';
import { Game } from './Game';

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

export const addSocketEvents = () => {
  function updatePlayers() {
    io.emit(
      PLAYERS_DATA,
      Object.values(Player.Players).map((p: Player) => {
        return p.name;
      })
    );
  }

  io.on(CONNECTION, function(socket: SocketIO.Socket) {
    Game.updateGames(socket);

    const onNewPlayer = (p: NewPlayer) => {
      Player.Players[p.id] = new Player(socket, p);
      const game = gameByPlayer(p.id);

      if (game) {
        game.addPlayer(p.id, socket);
        socket.emit(JOINED_GAME, game.id);
      }

      if (_disconnections[p.id]) {
        clearTimeout(_disconnections[p.id]);
        delete _disconnections[p.id];

        game.removeDisconnectedPlayer(p.id);
      }

      updatePlayers();
      Game.updateGames();
    };

    const onDisconnect = () => {
      const p = playerBySocket(socket.id);

      if (!p) {
        return;
      }

      const game = gameByPlayer(p.id);

      if (game) {
        const timerID = setTimeout(() => {
          game.removePlayerFromGame(p.id);

          delete _disconnections[p.id];
          delete Player.Players[p.id];
        }, RECONNECTION_TIME_LIMIT);

        _disconnections[p.id] = timerID;
        game.addDisconnectedPlayer(p.id);
      }

      updatePlayers();
      Game.updateGames();
    };

    const onNewGame = (gameConfig: IGameConfig) => {
      const p = playerBySocket(socket.id);

      if (!p) {
        return;
      }

      const game = new Game(gameConfig, p, socket);

      Game.Games[game.id] = game;

      socket.emit(JOINED_GAME, game.id);

      updatePlayers();
      Game.updateGames();
    };

    const onJoinGame = (id: string) => {
      const game = Game.Games[id];
      const player = playerBySocket(socket.id);

      if (!game || !player || game.gameStage !== GameStages.LOBBY) {
        return;
      }

      game.addPlayer(player.id, socket);
      socket.emit(JOINED_GAME, game.id);

      updatePlayers();
      Game.updateGames();
    };

    const onLeaveGame = (id: string) => {
      const game = Game.Games[id];
      const player = playerBySocket(socket.id);

      if (!game || !player) {
        return;
      }

      game.removePlayerFromGame(player.id);

      updatePlayers();
      Game.updateGames();
    };

    const onToggleReady = (id: string) => {
      const game = Game.Games[id];
      const player = playerBySocket(socket.id);

      if (!game || !player) {
        return;
      }

      game.togglePlayerReady(player.id);

      updatePlayers();
      Game.updateGames();
    };

    const onPlayerAnswer = (answer: string) => {
      const player = playerBySocket(socket.id);

      if (!player) return;

      const game = gameByPlayer(player.id);

      if (!game) return;

      game.registerAnswer(player.id, answer);
    };

    socket.on(DISCONNECT, onDisconnect);
    socket.on(NEW_PLAYER, onNewPlayer);
    socket.on(NEW_GAME, onNewGame);
    socket.on(JOIN_GAME, onJoinGame);
    socket.on(LEAVE_GAME, onLeaveGame);
    socket.on(TOGGLE_READY, onToggleReady);
    socket.on(PLAYER_ANSWER, onPlayerAnswer);
  });
};