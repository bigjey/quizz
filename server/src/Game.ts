import { Players, Player } from './Player';
import { Server, Socket } from 'socket.io';

import { COUNTDOWN_TO_GAME_START } from './../../shared/constants';
import { GAME_INFO, PLAYER_LEFT } from './../../shared/server-events';
import {
  GameInfoPayload,
  PlayerInfo,
  GamePlayer,
  GameStages,
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
interface CountDowns {
  [gameId: string]: NodeJS.Timeout;
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

  hostId: string;

  io: Server;
  id: string = null;
  questions: Question[] = questions;
  currentQuestion: number = 0;
  gameStage: GameStages = GameStages.LOBBY;

  players: GamePlayers = {};
  countDowns: CountDowns = {};

  constructor(io: Server, p: Player, s: Socket) {
    this.io = io;
    this.id = Math.random()
      .toString()
      .slice(2, 10);

    this.hostId = p.id;

    this.addPlayer(p.id, s);
  }

  addPlayer(id: string, s: Socket) {
    this.players[id] = new GamePlayer(id);

    s.join(this.id);

    this.updateGameInfo();
  }

  removePlayer(id: string) {
    delete this.players[id];

    this.updateGameInfo();
  }

  addDisconnectedPlayer(id: string) {
    this.players[id].disconnected = true;
    this.togglePlayerReady(id, false);

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
      this.io.to(this.id).emit(PLAYER_LEFT, {
        message: `player with nick ${this.addPlayer.name} has left the game`,
      });
    }

    this.updateGameInfo();
  }

  changeCurrentStage(gId: string) {
    const isEverybodyReady = Object.values(this.players).every(
      player => player.ready
    );

    let countDownId = null;

    if (isEverybodyReady) {
      this.gameStage = GameStages.LOBBY_COUNTDOWN;

      countDownId = setTimeout(() => {
        this.gameStage = GameStages.QUESTIONS;

        delete this.countDowns[gId];
      }, COUNTDOWN_TO_GAME_START);

      this.countDowns[gId] = countDownId;
    }

    if (!isEverybodyReady) {
      if (this.countDowns[gId]) {
        clearTimeout(countDownId);
      }
      this.gameStage = GameStages.LOBBY;
    }

    this.updateGameInfo();
  }

  getCurrentStage(gId: string) {
    this.changeCurrentStage(gId);

    return this.gameStage;
  }

  togglePlayerReady(id: string, ready: boolean = !this.players[id].ready) {
    this.players[id].ready = ready;

    this.updateGameInfo();
  }

  updateGameInfo() {
    this.io.to(this.id).emit(GAME_INFO, this.getGameInfoPayload());
  }

  getGameInfoPayload(): GameInfoPayload {
    return {
      id: this.id,
      players: Object.values(this.players).map(addPlayerInfo),
      gameStage: this.gameStage,
    };
  }
}
