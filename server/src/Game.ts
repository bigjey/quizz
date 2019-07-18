import { Socket } from 'socket.io';
import axios from 'axios';
import { Player } from './Player';

import { io } from './socketServer';

import { COUNTDOWN_TO_GAME_START, MAX_PLAYERS } from './../../shared/constants';
import {
  GAME_INFO,
  PLAYER_LEFT,
  GAMES_DATA,
} from './../../shared/server-events';
import {
  GameInfoPayload,
  GamePlayer,
  GameStages,
  GamesDataPayload,
  IGameConfig,
  QuestionForGame,
} from './../../shared/types';
import { shuffle } from './../../shared/utils/shuffle';

interface Option {
  text: string;
  correct: boolean;
}

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const questions = [
  {
    category: 'Entertainment: Books',
    type: 'multiple',
    difficulty: 'easy',
    question:
      'George Orwell wrote this book, which is often considered a statement on government oversight.',
    correct_answer: '1984',
    incorrect_answers: [
      'The Old Man and the Sea',
      'Catcher and the Rye',
      'To Kill a Mockingbird',
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
      io.emit(GAMES_DATA, payload);
    }
  }

  hostId: string;

  id: string = null;
  gameStage: GameStages = GameStages.LOBBY;

  players: GamePlayers = {};
  lobbyCountDown: NodeJS.Timeout;
  config: IGameConfig;

  currentQuestion: number = 0;
  questions: Question[] = null;

  questionCountdown: NodeJS.Timeout;
  questionResultsCountdown: NodeJS.Timeout;

  constructor(gConfig: IGameConfig, p: Player, s: Socket) {
    this.id = Math.random()
      .toString()
      .slice(2, 10);

    this.config = gConfig;
    this.setupGame();

    this.hostId = p.id;

    this.addPlayer(p.id, s);
  }

  async setupGame() {
    const { category, numOfQuestions, difficulty } = this.config;

    try {
      let url = `https://opentdb.com/api.php?amount=${3}&type=multiple`;
      if (category) {
        url += `&category=${category}`;
      }
      if (difficulty) {
        url += `&difficulty=${difficulty}`;
      }

      const opentdbJSON = await axios.get(url);

      const {
        data: { results },
      } = opentdbJSON;

      this.questions = results;
    } catch (error) {
      console.error(`Ooops, smth went wrong with this ${error}`);
    }
  }

  addPlayer(id: string, s: Socket) {
    this.players[id] = new GamePlayer(id);

    s.join(this.id);

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
      io.to(this.id).emit(PLAYER_LEFT, {
        message: `player with nick ${this.addPlayer.name} has left the game`,
      });

      if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
        this.stopLobbyCountDown();
      }
    }

    this.updateGameInfo();
  }

  startLobbyCountDown() {
    const isEverybodyReady = Object.values(this.players).every(
      player => player.ready
    );

    if (!isEverybodyReady) return;

    this.gameStage = GameStages.LOBBY_COUNTDOWN;

    this.lobbyCountDown = setTimeout(() => {
      this.gameStage = GameStages.QUESTIONS;
      this.nextQuestion();
      this.updateGameInfo();
    }, COUNTDOWN_TO_GAME_START);
  }

  stopLobbyCountDown() {
    if (this.lobbyCountDown) {
      Object.values(this.players).forEach(p => (p.ready = false));
      this.gameStage = GameStages.LOBBY;
      clearTimeout(this.lobbyCountDown);
    }
  }

  nextQuestion() {
    if (this.currentQuestion === this.questions.length) {
      this.gameStage = GameStages.GAME_OVER;
    } else {
      this.currentQuestion++;
      this.gameStage = GameStages.QUESTIONS;
      this.questionCountdown = setTimeout(() => {
        this.gameStage = GameStages.RESULTS;
        this.startQuestionResultsCountdown();
        this.updateGameInfo();
      }, 3000);
    }
  }

  startQuestionResultsCountdown() {
    this.questionResultsCountdown = setTimeout(() => {
      this.gameStage = GameStages.QUESTIONS;
      this.nextQuestion();
      this.updateGameInfo();
    }, 2000);
  }

  togglePlayerReady(id: string, ready: boolean = !this.players[id].ready) {
    this.players[id].ready = ready;

    if (this.gameStage === GameStages.LOBBY) {
      this.startLobbyCountDown();
    } else if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
      this.stopLobbyCountDown();
    }

    this.updateGameInfo();
  }

  registerAnswer(pId: string, answer: string) {
    this.players[pId].answers[this.currentQuestion] = answer;
  }

  sanitizeQuestion(q: Question): QuestionForGame {
    const answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

    return {
      question: q.question,
      answers,
    };
  }

  updateGameInfo() {
    const gameInfo = this.getGameInfoPayload();

    if (this.gameStage === GameStages.QUESTIONS) {
      gameInfo.question = this.sanitizeQuestion(
        this.questions[this.currentQuestion - 1]
      );
      gameInfo.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.RESULTS) {
      gameInfo.players.forEach(p => {
        p.answer = this.players[p.id].answers[this.currentQuestion];
      });
    }

    if (this.gameStage === GameStages.RESULTS) {
      gameInfo.players.forEach(p => {
        p.answers = this.players[p.id].answers;
      });
    }

    io.to(this.id).emit(GAME_INFO, gameInfo);
  }

  getGameInfoPayload(): GameInfoPayload {
    const payload = {
      id: this.id,
      players: Object.values(this.players).map(addPlayerInfo),
      gameStage: this.gameStage,
    };

    return payload;
  }
}
