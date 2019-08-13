import axios from 'axios';

import { QuestionForGame, GameStages, GamesListItem } from '../shared/types';
import { Player } from './Player';
import { Question, Game } from './Game';

export function getPlayerBySocketId(socketId: string): Player | null {
  const player = Object.values(Player.Players).find((p: Player) => {
    return p.socketId === socketId;
  });

  if (player) {
    return player;
  }

  return null;
}

export function getGameByPlayerId(id: string): Game | null {
  const game = Object.values(Game.Games).find((g: Game) => g['players'][id]);

  if (game) {
    return game;
  }

  return null;
}

export function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sanitizeQuestion(q: Question): QuestionForGame {
  const answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

  return {
    question: q.question,
    answers,
  };
}

export function isVisibleGame(game: Game): boolean {
  if (game['gameStage'] !== GameStages.LOBBY) return false;

  if (Object.keys(game['players']).length === game['config'].maxPlayers)
    return false;

  return true;
}

export function sanitizeGameForList(game: Game): GamesListItem {
  return {
    id: game['id'],
    hostName: Player.Players[game['hostId']]
      ? Player.Players[game['hostId']].name
      : null,
    playersCount: Object.keys(game['players']).length,
    config: game['config'],
  };
}
