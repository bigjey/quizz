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
}

export interface IGamePlayer {
  id: string;
  disconnected: boolean;
  ready: boolean;
  name?: string;
}

export class GamePlayer implements IGamePlayer {
  id: string = null;
  disconnected: boolean = false;
  ready: boolean = false;
  name: string = null;

  constructor(id: string) {
    this.id = id;
  }
}

export enum GameStages {
  LOBBY,
  LOBBY_COUNTDOWN,
  QUESTIONS,
  RESULTS,
}
