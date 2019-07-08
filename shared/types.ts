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
  players: PlayerInfo[];
  disconnectedPlayers: PlayerInfo[];
}
