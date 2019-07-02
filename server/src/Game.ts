import { Players, Player } from "./Player";
import { Server, Socket } from "socket.io";

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
    text: "Are you bored?",
    options: [
      {
        text: "Ofc",
        correct: false
      },
      {
        text: "Ofc no",
        correct: false
      },
      {
        text: "Yes",
        correct: false
      },
      {
        text: "Da",
        correct: true
      }
    ]
  },
  {
    text: "Will you ever do it again?",
    options: [
      {
        text: "Ofc",
        correct: false
      },
      {
        text: "Ofc no",
        correct: true
      },
      {
        text: "Yes",
        correct: false
      },
      {
        text: "Da",
        correct: false
      }
    ]
  }
];

export class Game {
  static Games: {
    [key: string]: Game;
  } = {};

  hostId: string;

  io: Server;
  id: string = null;
  players: Set<string> = new Set();

  questions: Question[] = questions;
  currentQuestion: number = 0;

  constructor(io: Server, p: Player, s: Socket) {
    this.io = io;
    this.id = Math.random()
      .toString()
      .slice(2, 10);

    this.hostId = p.id;

    this.addPlayer(p.id, s);
  }

  addPlayer(id: string, s: Socket) {
    this.players.add(id);

    s.join(this.id);

    this.updateGameInfo();
  }

  removePlayer(id: string) {
    this.players.delete(id);

    this.updateGameInfo();
  }

  updateGameInfo() {
    this.io.to(this.id).emit("game-info", {
      id: this.id,
      players: Array.from(this.players),
      question: this.questions[this.currentQuestion]
    });
  }
}
