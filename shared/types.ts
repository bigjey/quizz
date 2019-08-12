export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface GamesListItem {
  id: string;
  hostName?: string;
  playersCount: number;
  config: IGameConfig;
}

export type GamesDataPayload = GamesListItem[];

export interface PlayerInfo {
  id: string;
  name: string;
}

export interface GameInfoPayload {
  id: string;
  players: GamePlayer[];
  gameStage: GameStages;
  question?: QuestionForGame;
  questionNumber?: number;
  correctAnswer?: string;
  results?: any;
}

export interface IGamePlayer {
  id: string;
  disconnected: boolean;
  ready: boolean;
  name?: string;
}

export interface IGameConfig {
  name: string;
  password: string;
  category: {
    id: number;
    name: string;
  };
  difficulty: GameDifficulty;
  numOfQuestions: number;
  maxPlayers: number;
}
export interface IAnswer {
  text: string;
  isCorrect: boolean;
}
export class GamePlayer implements IGamePlayer {
  id: string = null;
  disconnected: boolean = false;
  ready: boolean = false;
  name: string = null;
  answer?: IAnswer;
  answers: {
    [round: number]: string;
  };

  constructor(id: string) {
    this.id = id;
    this.answers = {};
  }
}

export enum GameStages {
  LOBBY,
  LOBBY_COUNTDOWN,
  QUESTIONS,
  INTERMEDIATE_RESULTS,
  ROUND_END_RESULTS,
  GAME_OVER,
}

export interface QuestionForGame {
  question: string;
  answers: string[];
}
