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
import { getPlayerBySocketId, getGameByPlayerId } from './utils';

interface Idisconnections {
  [pId: string]: NodeJS.Timeout;
}

const _disconnections: Idisconnections = {};
const RECONNECTION_TIME_LIMIT: number = 10000;

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
      const game = getGameByPlayerId(p.id);

      if (game) {
        game.addPlayer(p.id);
        socket.emit(JOINED_GAME, game.id);
      }

      if (_disconnections[p.id]) {
        clearTimeout(_disconnections[p.id]);
        delete _disconnections[p.id];

        game.removeDisconnectedPlayer(p.id);
        game.updateGameInfo();
      }

      updatePlayers();
      Game.updateGames();
    };

    const onDisconnect = () => {
      const p = getPlayerBySocketId(socket.id);

      if (!p) {
        return;
      }

      const game = getGameByPlayerId(p.id);

      if (game) {
        const timerID = setTimeout(() => {
          game.removePlayerFromGame(p.id);

          delete _disconnections[p.id];
          delete Player.Players[p.id];
        }, RECONNECTION_TIME_LIMIT);

        _disconnections[p.id] = timerID;
        game.addDisconnectedPlayer(p.id);
        game.updateGameInfo();
      }

      updatePlayers();
      Game.updateGames();
    };

    const onNewGame = async (gameConfig: IGameConfig) => {
      const p = getPlayerBySocketId(socket.id);

      if (!p) {
        return;
      }

      const game = await new Game(gameConfig, p.id);

      Game.Games[game.id] = game;

      game.addPlayer(p.id);
      game.updateGameInfo();

      socket.emit(JOINED_GAME, game.id);

      updatePlayers();
      Game.updateGames();
    };

    const onJoinGame = (id: string) => {
      const game = Game.Games[id];
      const player = getPlayerBySocketId(socket.id);

      if (!game || !player || game.gameStage !== GameStages.LOBBY) {
        return;
      }

      game.addPlayer(player.id);
      game.updateGameInfo();
      socket.emit(JOINED_GAME, game.id);

      updatePlayers();
      Game.updateGames();
    };

    const onLeaveGame = (id: string) => {
      const game = Game.Games[id];
      const player = getPlayerBySocketId(socket.id);

      if (!game || !player) {
        return;
      }

      game.removePlayerFromGame(player.id);
      game.updateGameInfo();

      updatePlayers();
      Game.updateGames();
    };

    const onToggleReady = (id: string) => {
      const game = Game.Games[id];
      const player = getPlayerBySocketId(socket.id);

      if (!game || !player) {
        return;
      }

      game.togglePlayerReady(player.id);
      game.updateGameInfo();

      updatePlayers();
      Game.updateGames();
    };

    const onPlayerAnswer = (answer: string) => {
      const player = getPlayerBySocketId(socket.id);

      if (!player) return;

      const game = getGameByPlayerId(player.id);

      if (!game) return;

      game.registerAnswer(player.id, answer);
      game.updateGameInfo();
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
