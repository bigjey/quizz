import { Socket } from "socket.io";

export interface NewPlayer {
  id: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
}

export interface Players {
  [id: string]: Player;
}

export class Player {
  static Players: Players = {};

  id: string = null;
  name: string = null;
  socketId: string = null;

  constructor(s: Socket, p: NewPlayer) {
    this.id = p.id;
    this.name = p.name;
    this.socketId = s.id;
  }
}
