import { shuffle, getPlayerBySocketId, getGameByPlayerId } from './utils';
import { Player } from './Player';
import { io } from './socketServer';
import { Game } from './Game';
import { IGameConfig } from '../shared/types';
import {
  socket1,
  socket2,
  player1,
  player2,
  normalGameConfig,
  MOCKED_TRIVIA_API_RESPONSE,
} from './__mocks__/fixtures';
import axios from 'axios';

jest.mock('./socketServer.ts');
jest.mock('axios');

(axios.get as any).mockReturnValue(MOCKED_TRIVIA_API_RESPONSE);

jest.useFakeTimers();

jest.mock('./socketServer.ts');

describe('utils#getPlayerBySocketId', () => {
  beforeAll(() => {
    io.sockets.sockets = {};
    io.sockets.sockets[socket1.id] = socket1;
    io.sockets.sockets[socket2.id] = socket2;

    Player.Players = {};
    Player.Players[player1.id] = player1;
    Player.Players[player2.id] = player2;
  });

  it('should return null if player is not in registry', () => {
    expect(getPlayerBySocketId('random-id')).toBe(null);
  });

  it('should return player object if it is in registry', () => {
    expect(getPlayerBySocketId(socket1.id)).toBe(player1);
  });
});

describe('utils#getGameByPlayerId', () => {
  let game: Game;

  beforeEach(async () => {
    io.sockets.sockets = {};
    io.sockets.sockets[socket1.id] = socket1;
    io.sockets.sockets[socket2.id] = socket2;

    Player.Players = {};
    Player.Players[player1.id] = player1;
    Player.Players[player2.id] = player2;

    Game.Games = {};
    game = await new Game(normalGameConfig, player1.id);
    Game.Games[game.id] = game;
  });

  it('should return null if game is not in registry', () => {
    expect(getGameByPlayerId('random-id')).toBe(null);
  });

  it('should return null if player is not in any game', () => {
    expect(getGameByPlayerId(player1.id)).toBe(null);
  });

  it('should return the game player is inside', () => {
    game.addPlayer(player1.id);

    expect(getGameByPlayerId(player1.id)).toBe(game);
  });

  it('should return null after player leaves the game', () => {
    game.addPlayer(player1.id);
    game.removePlayerFromGame(player1.id);

    expect(getGameByPlayerId(player1.id)).toBe(null);
  });
});

describe('utils#shuffle', () => {
  const arr = [1, 2, 'a', null, undefined];
  const result = shuffle(arr);

  it('should return array of same length', () => {
    expect(result).toHaveLength(arr.length);
  });

  it('should return same values', () => {
    expect(result.sort()).toEqual(arr.sort());
  });
});
