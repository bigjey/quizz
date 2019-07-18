export interface GamesListItem {
  id: string;
  maxPlayers: number;
  playersCount: number;
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
  category: number;
  difficulty: 'any' | 'easy' | 'medium' | 'hard';
  numOfQuestions: number;
  maxPlayers: number;
}

export class GamePlayer implements IGamePlayer {
  id: string = null;
  disconnected: boolean = false;
  ready: boolean = false;
  name: string = null;
  answer?: string;
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
  RESULTS,
  GAME_OVER,
}

export interface QuestionForGame {
  question: string;
  answers: string[];
}
