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
  lobbyCountDown: NodeJS.Timeout;

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

  startLobbyCountDown() {
    this.lobbyCountDown = setTimeout(() => {
      this.gameStage = GameStages.QUESTIONS;
      this.updateGameInfo();
    }, COUNTDOWN_TO_GAME_START);
  }

  stopLobbyCountDown() {
    if (this.lobbyCountDown) {
      clearTimeout(this.lobbyCountDown);
    }
  }

  togglePlayerReady(id: string, ready: boolean = !this.players[id].ready) {
    let isEverybodyReady = false;

    this.players[id].ready = ready;

    isEverybodyReady = Object.values(this.players).every(
      player => player.ready
    );

    if (isEverybodyReady) {
      this.startLobbyCountDown();
    } else {
      this.stopLobbyCountDown();
    }

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
