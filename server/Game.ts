import { GamesListItem } from './../shared/types';
import { Socket } from 'socket.io';
import axios from 'axios';
import { Player } from './Player';

import { io } from './socketServer';

import { COUNTDOWN_TO_GAME_START, MAX_PLAYERS } from '../shared/constants';
import { GAME_INFO, PLAYER_LEFT, GAMES_DATA } from '../shared/server-events';
import {
  GameInfoPayload,
  GamePlayer,
  GameStages,
  GamesDataPayload,
  IGameConfig,
  QuestionForGame,
} from '../shared/types';
import { shuffle } from '../shared/utils/shuffle';

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

interface GamePlayers {
  [playerId: string]: GamePlayer;
}

const addPlayerInfo = (p: GamePlayer) => {
  return {
    ...p,
    name: Player.Players[p.id].name,
  };
};

const NEXT_QUESTION_COUNTDOWN: number = 10000;
const INTERMEDIATE_RESULTS_VISIBILITY_TIME: number = 4000;
const ROUND_END_RESULTS_VISIBILITY_TIME: number = 4000;
export class Game {
  static Games: {
    [key: string]: Game;
  } = {};

  static updateGames(socket?: Socket) {
    const payload: GamesDataPayload = Object.values(this.Games)
      .filter(
        (g): boolean => {
          if (g.gameStage !== GameStages.LOBBY) return false;

          if (Object.keys(g.players).length === MAX_PLAYERS) return false;

          return true;
        }
      )
      .map(
        (g: Game): GamesListItem => ({
          id: g.id,
          hostName: Player.Players[g.hostId]
            ? Player.Players[g.hostId].name
            : null,
          playersCount: Object.keys(g.players).length,
          config: g.config,
        })
      );

    if (socket) {
      socket.emit(GAMES_DATA, payload);
    } else {
      io.emit(GAMES_DATA, payload);
    }
  }

  hostId: string;
  sanitizedQuestion: QuestionForGame;

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
      .slice(2, 7);

    this.config = gConfig;
    this.setupGame();

    this.hostId = p.id;

    this.addPlayer(p.id, s);
  }

  async setupGame() {
    const { category, numOfQuestions, difficulty } = this.config;

    try {
      let url = `https://opentdb.com/api.php?amount=${numOfQuestions}&type=multiple`;
      if (category) {
        url += `&category=${category.id}`;
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
      this.sanitizedQuestion = this.sanitizeQuestion(
        this.questions[this.currentQuestion - 1]
      );
      this.gameStage = GameStages.QUESTIONS;
      this.questionCountdown = setTimeout(() => {
        this.gameStage = GameStages.INTERMEDIATE_RESULTS;
        this.startIntermediateResultsCountdown();
        this.updateGameInfo();
      }, NEXT_QUESTION_COUNTDOWN);
    }
  }

  startIntermediateResultsCountdown() {
    this.questionResultsCountdown = setTimeout(() => {
      this.gameStage = GameStages.ROUND_END_RESULTS;
      this.startRoundEndResultsCountdown();
      this.updateGameInfo();
    }, INTERMEDIATE_RESULTS_VISIBILITY_TIME);
  }

  startRoundEndResultsCountdown() {
    this.questionResultsCountdown = setTimeout(() => {
      this.nextQuestion();
      this.updateGameInfo();
    }, ROUND_END_RESULTS_VISIBILITY_TIME);
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

  isEverybodyAnsweredInAdvance() {
    return Object.values(this.players).every(player => {
      const currAnswer = this.players[player.id].answers[this.currentQuestion];

      return currAnswer;
    });
  }

  registerAnswer(pId: string, answer: string) {
    this.players[pId].answers[this.currentQuestion] = answer;

    if (this.isEverybodyAnsweredInAdvance()) {
      clearTimeout(this.questionCountdown);
      this.gameStage = GameStages.ROUND_END_RESULTS;
      this.startRoundEndResultsCountdown();
      this.updateGameInfo();
    }
  }

  sanitizeQuestion(q: Question): QuestionForGame {
    const answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

    return {
      question: q.question,
      answers,
    };
  }

  checkIfAnswerCorrect(answer: string): boolean {
    return this.questions.some(q => q.correct_answer === answer);
  }

  updateGameInfo() {
    const gameInfo = this.getGameInfoPayload();

    if (
      this.gameStage === GameStages.QUESTIONS ||
      this.gameStage === GameStages.INTERMEDIATE_RESULTS
    ) {
      gameInfo.question = this.sanitizedQuestion;
      gameInfo.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.INTERMEDIATE_RESULTS) {
      gameInfo.correctAnswer = this.questions[
        this.currentQuestion - 1
      ].correct_answer;
      gameInfo.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.ROUND_END_RESULTS) {
      gameInfo.players.forEach(p => {
        const text = this.players[p.id].answers[this.currentQuestion];
        p.answer = {
          text,
          isCorrect: this.checkIfAnswerCorrect(text),
        };
      });
      gameInfo.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.GAME_OVER) {
      gameInfo.results = Object.values(this.players)
        .map(player => {
          const name = Player.Players[player.id].name;
          return {
            name,
            score: this.questions.reduce((score, question, round) => {
              if (player.answers[round + 1] === question.correct_answer) {
                score += 1;
              }
              return score;
            }, 0),
          };
        })
        .sort((pr1, pr2) => pr2.score - pr1.score);
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
