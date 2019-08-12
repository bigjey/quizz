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
import { sanitizeQuestion } from './utils';

export interface Option {
  text: string;
  correct: boolean;
}

export interface Question {
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

export const NEXT_QUESTION_COUNTDOWN: number = 10000;
export const INTERMEDIATE_RESULTS_VISIBILITY_TIME: number = 4000;
export const ROUND_END_RESULTS_VISIBILITY_TIME: number = 4000;

const isVisibleGame = (game: Game): boolean => {
  if (game['gameStage'] !== GameStages.LOBBY) return false;

  if (Object.keys(game['players']).length === game['config'].maxPlayers)
    return false;

  return true;
};

const sanitizeGameForList = (game: Game): GamesListItem => ({
  id: game['id'],
  hostName: Player.Players[game['hostId']]
    ? Player.Players[game['hostId']].name
    : null,
  playersCount: Object.keys(game['players']).length,
  config: game['config'],
});

export class Game {
  public static Games: {
    [key: string]: Game;
  } = {};

  public static getVisibleGames(): GamesDataPayload {
    return Object.values(this.Games)
      .filter(isVisibleGame)
      .map(sanitizeGameForList);
  }

  public static updateGames(socket?: Socket) {
    if (socket) {
      socket.emit(GAMES_DATA, this.getVisibleGames());
    } else {
      io.emit(GAMES_DATA, this.getVisibleGames());
    }
  }

  public id: string = null;

  private hostId: string;
  private sanitizedQuestion: QuestionForGame;

  public gameStage: GameStages = GameStages.LOBBY;

  private players: GamePlayers = {};
  private config: IGameConfig;

  private currentQuestion: number = 0;
  private questions: Question[] = null;

  private lobbyCountDown: NodeJS.Timeout = null;
  private questionCountdown: NodeJS.Timeout = null;
  private questionResultsCountdown: NodeJS.Timeout = null;

  public constructor(gConfig: IGameConfig, hostId: string) {
    this.id = Math.random()
      .toString()
      .slice(2, 7);

    this.config = gConfig;
    this.hostId = hostId;

    this.setupGame();
  }

  private async setupGame() {
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

  public addPlayer(pId: string) {
    this.players[pId] = new GamePlayer(pId);

    const player = Player.Players[pId];
    if (!player) {
      return;
    }

    const socket = io.sockets.sockets[player.socketId];
    if (!socket) {
      return;
    }

    socket.join(this.id);
  }

  public addDisconnectedPlayer(id: string) {
    this.players[id].disconnected = true;
    this.togglePlayerReady(id, false);
  }

  public removeDisconnectedPlayer(id: string) {
    this.players[id].disconnected = false;
  }

  public removePlayerFromGame(id: string) {
    delete this.players[id];

    const player = Player.Players[id];

    if (!player) {
      return;
    }

    io.to(this.id).emit(PLAYER_LEFT, {
      message: `player with nick ${this.addPlayer.name} has left the game`,
    });

    this.stopLobbyCountDown();
  }

  private isEverybodyReady(): boolean {
    return Object.values(this.players).every(player => player.ready);
  }

  private startLobbyCountDown() {
    this.gameStage = GameStages.LOBBY_COUNTDOWN;

    this.lobbyCountDown = setTimeout(
      this.afterLobbyCountdown,
      COUNTDOWN_TO_GAME_START
    );
  }

  private afterLobbyCountdown = () => {
    this.nextQuestion();
    this.updateGameInfo();
  };

  private stopLobbyCountDown() {
    if (this.lobbyCountDown) {
      Object.values(this.players).forEach(p => (p.ready = false));
      this.gameStage = GameStages.LOBBY;
    }

    clearTimeout(this.lobbyCountDown);
    this.lobbyCountDown = null;
  }

  private nextQuestion() {
    if (this.currentQuestion === this.questions.length) {
      this.gameStage = GameStages.GAME_OVER;
    } else {
      this.currentQuestion++;
      this.gameStage = GameStages.QUESTIONS;
      this.sanitizedQuestion = sanitizeQuestion(
        this.questions[this.currentQuestion - 1]
      );
      this.questionCountdown = setTimeout(() => {
        this.gameStage = GameStages.INTERMEDIATE_RESULTS;
        this.startIntermediateResultsCountdown();
        this.updateGameInfo();
      }, NEXT_QUESTION_COUNTDOWN);
    }
  }

  private startIntermediateResultsCountdown() {
    this.questionResultsCountdown = setTimeout(() => {
      this.gameStage = GameStages.ROUND_END_RESULTS;
      this.startRoundEndResultsCountdown();
      this.updateGameInfo();
    }, INTERMEDIATE_RESULTS_VISIBILITY_TIME);
  }

  private startRoundEndResultsCountdown() {
    this.questionResultsCountdown = setTimeout(() => {
      this.nextQuestion();
      this.updateGameInfo();
    }, ROUND_END_RESULTS_VISIBILITY_TIME);
  }

  public togglePlayerReady(
    id: string,
    ready: boolean = !this.players[id].ready
  ) {
    this.players[id].ready = ready;

    if (this.gameStage === GameStages.LOBBY && this.isEverybodyReady()) {
      this.startLobbyCountDown();
    } else if (this.gameStage === GameStages.LOBBY_COUNTDOWN) {
      this.stopLobbyCountDown();
    }
  }

  private isEverybodyAnsweredInAdvance() {
    return Object.values(this.players).every(player => {
      const currAnswer = this.players[player.id].answers[this.currentQuestion];

      return currAnswer;
    });
  }

  public registerAnswer(pId: string, answer: string) {
    this.players[pId].answers[this.currentQuestion] = answer;

    if (this.isEverybodyAnsweredInAdvance()) {
      clearTimeout(this.questionCountdown);
      this.questionCountdown = null;
      this.gameStage = GameStages.INTERMEDIATE_RESULTS;
      this.startIntermediateResultsCountdown();
      this.updateGameInfo();
    }
  }

  private checkIfAnswerCorrect(answer: string): boolean {
    return this.questions.some(q => q.correct_answer === answer);
  }

  public updateGameInfo() {
    io.to(this.id).emit(GAME_INFO, this.getGameInfoPayload());
  }

  public getGameInfoPayload(): GameInfoPayload {
    const payload: GameInfoPayload = {
      id: this.id,
      players: Object.values(this.players).map(addPlayerInfo),
      gameStage: this.gameStage,
    };

    if (
      this.gameStage === GameStages.QUESTIONS ||
      this.gameStage === GameStages.INTERMEDIATE_RESULTS
    ) {
      payload.question = this.sanitizedQuestion;
      payload.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.INTERMEDIATE_RESULTS) {
      payload.correctAnswer = this.questions[
        this.currentQuestion - 1
      ].correct_answer;
      payload.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.ROUND_END_RESULTS) {
      payload.players.forEach(p => {
        const text = this.players[p.id].answers[this.currentQuestion];
        p.answer = {
          text,
          isCorrect: this.checkIfAnswerCorrect(text),
        };
      });
      payload.questionNumber = this.currentQuestion;
    }

    if (this.gameStage === GameStages.GAME_OVER) {
      payload.results = Object.values(this.players)
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

    return payload;
  }
}
