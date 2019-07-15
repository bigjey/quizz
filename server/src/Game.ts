import { Players, Player } from './Player';
import { Server, Socket } from 'socket.io';

import { COUNTDOWN_TO_GAME_START, MAX_PLAYERS } from './../../shared/constants';
import {
  GAME_INFO,
  PLAYER_LEFT,
  GAMES_DATA,
} from './../../shared/server-events';
import {
  GameInfoPayload,
  PlayerInfo,
  GamePlayer,
  GameStages,
  GamesDataPayload,
} from './../../shared/types';

interface Option {
  text: string;
  correct: boolean;
}

interface Question {
  text: string;
  options: Option[];
}

const questions = [
  {
    text: 'Are you bored?',
    options: [
      {
        text: 'Ofc',
        correct: false,
      },
      {
        text: 'Ofc no',
        correct: false,
      },
      {
        text: 'Yes',
        correct: false,
      },
      {
        text: 'Da',
        correct: true,
      },
    ],
  },
  {
    text: 'Will you ever do it again?',
    options: [
      {
        text: 'Ofc',
        correct: false,
      },
      {
        text: 'Ofc no',
        correct: true,
      },
      {
        text: 'Yes',
        correct: false,
      },
      {
        text: 'Da',
        correct: false,
      },
    ],
  },
];

interface GamePlayers {
  [playerId: string]: GamePlayer;
}

const addPlayerInfo = (p: GamePlayer) => {
  return {
    ...p,
    name: Player.Players[p.id].name,
  };
};

export class Game {
  static Games: {
    [key: string]: Game;
  } = {};

  static io: Server;

  static updateGames(socket?: Socket) {
    const payload: GamesDataPayload = Object.values(this.Games)
      .filter(g => {
        if (g.gameStage !== GameStages.LOBBY) return false;

        if (Object.keys(g.players).length === MAX_PLAYERS) return false;

        return true;
      })
      .map((g: Game) => ({
        id: g.id,
        maxPlayers: MAX_PLAYERS,
        playersCount: Object.keys(g.players).length,
      }));

    if (socket) {
      socket.emit(GAMES_DATA, payload);
    } else {
      Game.io.emit(GAMES_DATA, payload);
    }
  }

  hostId: string;

  id: string = null;
  questions: Question[] = questions;
  currentQuestion: number = 0;
  gameStage: GameStages = GameStages.LOBBY;

  players: GamePlayers = {};
  lobbyCountDown: NodeJS.Timeout;

  constructor(io: Server, p: Player, s: Socket) {
    this.id = Math.random()
      .toString()
      .slice(2, 10);

    this.hostId = p.id;

    this.addPlayer(p.id, s);
  }

  addPlayer(id: string, s: Socket) {
    this.players[id] = new GamePlayer(id);

    s.join(this.id);

    Game.updateGames();
    this.updateGameInfo();
  }

  removePlayer(id: string) {
    delete this.players[id];

    if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
      this.stopLobbyCountDown();
    }

    this.updateGameInfo();
  }

  addDisconnectedPlayer(id: string) {
    this.players[id].disconnected = true;
    this.togglePlayerReady(id, false);

    if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
      this.stopLobbyCountDown();
    }

    this.updateGameInfo();
  }

  removeDisconnectedPlayer(id: string) {
    this.players[id].disconnected = false;

    this.updateGameInfo();
  }

  removePlayerFromGame(id: string) {
    delete this.players[id];

    const player = Player.Players[id];

    if (player) {
      Game.io.to(this.id).emit(PLAYER_LEFT, {
        message: `player with nick ${this.addPlayer.name} has left the game`,
      });

      if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
        this.stopLobbyCountDown();
      }
    }

    Game.updateGames();
    this.updateGameInfo();
  }

  startLobbyCountDown() {
    console.log('startLobbyCountDown');

    const isEverybodyReady = Object.values(this.players).every(
      player => player.ready
    );

    console.log({ isEverybodyReady });

    if (!isEverybodyReady) return;

    this.gameStage = GameStages.LOBBY_COUNTDOWN;

    console.log('new game stage', this.gameStage);

    this.lobbyCountDown = setTimeout(() => {
      this.gameStage = GameStages.QUESTIONS;
      this.updateGameInfo();
    }, COUNTDOWN_TO_GAME_START);
  }

  stopLobbyCountDown() {
    console.log('stopLobbyCountDown');
    if (this.lobbyCountDown) {
      Object.values(this.players).forEach(p => (p.ready = false));
      this.gameStage = GameStages.LOBBY;
      clearTimeout(this.lobbyCountDown);
    }
  }

  togglePlayerReady(id: string, ready: boolean = !this.players[id].ready) {
    this.players[id].ready = ready;

    if (this.gameStage === GameStages.LOBBY) {
      this.startLobbyCountDown();
    } else if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
      this.stopLobbyCountDown();
    }

    Game.updateGames();

    this.updateGameInfo();
  }

  updateGameInfo() {
    Game.io.to(this.id).emit(GAME_INFO, this.getGameInfoPayload());
  }

  getGameInfoPayload(): GameInfoPayload {
    const payload = {
      id: this.id,
      players: Object.values(this.players).map(addPlayerInfo),
      gameStage: this.gameStage,
    };

    console.log('gameInfo', payload);

    return payload;
  }
}
