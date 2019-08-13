import axios from 'axios';

import {
  Game,
  NEXT_QUESTION_COUNTDOWN,
  ROUND_END_RESULTS_VISIBILITY_TIME,
  INTERMEDIATE_RESULTS_VISIBILITY_TIME,
  KILL_GAME_TIME,
  KICK_ALL_PLAYERS_TIME,
} from './Game';
import { io } from './socketServer';
import {
  IGameConfig,
  GamePlayer,
  GameDifficulty,
  GameStages,
} from '../shared/types';
import { Player, Players } from './Player';
import { Socket as createSocket } from './__mocks__/socket';
import {
  PLAYER_LEFT,
  GAME_INFO,
  GAMES_DATA,
  KILL_GAME,
} from '../shared/server-events';

import {
  socket1,
  socket2,
  player1,
  player2,
  normalGameConfig,
  MOCKED_TRIVIA_API_RESPONSE,
} from './__mocks__/fixtures';

jest.mock('./socketServer.ts');
jest.mock('axios');

jest.useFakeTimers();

io.sockets.sockets[socket1.id] = socket1;
io.sockets.sockets[socket2.id] = socket2;

Player.Players[player1.id] = player1;
Player.Players[player2.id] = player2;

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();

  (axios.get as any).mockReturnValue(MOCKED_TRIVIA_API_RESPONSE);
});

describe('Game', () => {
  describe('static #updateGames', () => {
    // beforeEach(async () => {
    //   // const game1 = await new Game(normalGameConfig, player1.id);
    //   // Game.Games[game1.id] = game1;

    //   // game1.addPlayer(player1.id);

    //   // const game2 = await new Game(
    //   //   { ...normalGameConfig, name: 'game 2' },
    //   //   player2.id
    //   // );
    //   // Game.Games[game2.id] = game1;

    //   // game2.addPlayer(player2.id);
    // });

    it('should send data to one player if provided, to all players otherwise', () => {
      const v = [1, 2, 3];

      const originalFn = Game.getVisibleGames;

      Game.getVisibleGames = jest.fn().mockReturnValue(v);

      Game.updateGames();

      expect(io.emit).lastCalledWith(GAMES_DATA, v);

      Game.updateGames(socket2);

      expect(socket2.emit).lastCalledWith(GAMES_DATA, v);

      Game.getVisibleGames = originalFn;
    });
  });

  describe('#constructor', () => {
    it('should create new game with default props', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      expect(game.id).toBeDefined();
      expect(game['config']).toBe(normalGameConfig);
      expect(game['hostId']).toBe(player1.id);

      expect(game['gameStage']).toBe(GameStages.LOBBY);
      expect(game['currentQuestion']).toBe(0);
      expect(game['questions']).toBe(MOCKED_TRIVIA_API_RESPONSE.data.results);
      expect(Object.keys(game['players']).length).toBe(0);
    });
  });

  describe('#setupGame', () => {
    it('should make an HTTP request with correct params', async () => {
      await new Game(normalGameConfig, player1.id);

      let url = `https://opentdb.com/api.php?amount=${
        normalGameConfig.numOfQuestions
      }&type=multiple`;

      expect(axios.get).toHaveBeenLastCalledWith(url);
    });

    it('should make an HTTP request with correct params', async () => {
      let diff: GameDifficulty = 'easy';
      await new Game({ ...normalGameConfig, difficulty: diff }, player1.id);

      let url = `https://opentdb.com/api.php?amount=${
        normalGameConfig.numOfQuestions
      }&type=multiple`;
      url += `&difficulty=${diff}`;

      expect(axios.get).toHaveBeenLastCalledWith(url);
    });

    it('should make an HTTP request with correct params', () => {
      let diff: GameDifficulty = 'easy';
      let catId = 1;
      new Game(
        {
          ...normalGameConfig,
          difficulty: diff,
          category: {
            id: catId,
            name: 'Test',
          },
        },
        player1.id
      );

      let url = `https://opentdb.com/api.php?amount=${
        normalGameConfig.numOfQuestions
      }&type=multiple`;
      url += `&category=${catId}`;
      url += `&difficulty=${diff}`;

      expect(axios.get).toHaveBeenLastCalledWith(url);
    });

    it('should process reject', async () => {
      // const originalFn = console.error;
      // console.error = jest.fn();
      // (axios.get as any).mockRejectedValue(1);
      // new Game(normalGameConfig, player1.id);
      // await new Promise(r =>
      //   setTimeout(() => {
      //     console.log('resolved()');
      //     r();
      //   }, 100)
      // );
      // jest.runAllTimers();
      // expect(console.error).lastCalledWith(
      //   `Ooops, smth went wrong with this ${1}`
      // );
      // console.error = originalFn;
    });

    it('should set game questions from HTTP response', async () => {
      (axios.get as any).mockReturnValueOnce({ data: { results: [1, 2, 3] } });

      const game = await new Game(normalGameConfig, player1.id);

      expect(game['questions']).toEqual([1, 2, 3]);
    });
  });

  describe('#addPlayer', () => {
    it('should add player to the game', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      expect(() => game.addPlayer('yolop')).not.toThrow();
    });

    it('should add player to the game', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);

      expect(game['players']).toHaveProperty(player1.id);
      expect(game['players'][player1.id]).toBeInstanceOf(GamePlayer);

      expect(Object.keys(game['players']).length).toBe(1);
    });

    it('should handle adding multiple players to the game', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      expect(game['players']).toHaveProperty(player2.id);

      expect(Object.keys(game['players']).length).toBe(2);
    });

    it('should join player to the socket room', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);

      expect(socket1.join).toHaveBeenCalledWith(game.id);

      game.addPlayer(player2.id);

      expect(socket2.join).toHaveBeenCalledWith(game.id);
    });
  });

  describe('#addDisconnectedPlayer', () => {
    it('should mark player as disconnected', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addDisconnectedPlayer(player1.id);

      expect(game['players'][player1.id].disconnected).toBe(true);
    });
  });

  describe('#removeDisconnectedPlayer', () => {
    it('should mark player as not disconnected', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addDisconnectedPlayer(player1.id);
      game.removeDisconnectedPlayer(player1.id);

      expect(game['players'][player1.id].disconnected).toBe(false);
    });
  });

  describe('#removePlayerFromGame', () => {
    it('should remove player from players list', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.removePlayerFromGame(player1.id);

      expect(game['players']).not.toHaveProperty(player1.id);
    });

    it('should notify players in game', async () => {
      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);
      game.removePlayerFromGame(player1.id);

      expect(io.to).toBeCalledWith(game.id);
      expect(io.emit).toBeCalledWith(PLAYER_LEFT, {
        message: `player with nick ${player1.name} has left the game`,
      });
    });

    it('should call stopLobbyCountDown', async () => {
      const stopLobbyCountDownSpy = jest.spyOn(
        Game.prototype as any,
        'stopLobbyCountDown'
      );

      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);
      game.removePlayerFromGame(player1.id);

      expect(stopLobbyCountDownSpy).toBeCalled();
    });
  });

  describe('#startKillGame', () => {
    it('should kill all games within 4 seconds of last player left the game', async () => {
      const game = await new Game(normalGameConfig, player1.id);
      Game.Games[game.id] = game;
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      game.addPlayer(player1.id);
      expect(game['killEmptyGamesCountdown']).toBe(null);

      game.removePlayerFromGame(player1.id);
      expect(typeof game['killEmptyGamesCountdown']).toBe('number');

      expect(setTimeoutSpy).toBeCalledWith(
        expect.any(Function),
        KILL_GAME_TIME
      );

      // run timer
      expect(Game.Games).toHaveProperty(game.id);
      jest.runOnlyPendingTimers();

      // check if game was deleted
      expect(Game.Games).not.toHaveProperty(game.id);
    });

    it('should clear killGame timeout if a player joined', async () => {
      const game = await new Game(normalGameConfig, player1.id);
      Game.Games[game.id] = game;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const timeout = game['killEmptyGamesCountdown'];

      game.addPlayer(player1.id);
      game.removePlayerFromGame(player1.id);
      game.addPlayer(player2.id);

      jest.runOnlyPendingTimers();

      expect(Game.Games).toHaveProperty(game.id);
      expect(clearTimeoutSpy).toBeCalledWith(timeout);
      expect(game['killEmptyGamesCountdown']).toBe(null);
    });
  });

  describe('#startKickAllPlayersCountdown', () => {});

  describe('#togglePlayerReady', () => {
    describe('changes ready status of provided player', () => {
      let game: Game;

      beforeEach(async () => {
        game = await new Game(normalGameConfig, player1.id);

        game.addPlayer(player1.id);
        game.addPlayer(player2.id);
      });

      it('should flip status if no status provided', async () => {
        const readyStatus = game['players'][player1.id].ready;

        game.togglePlayerReady(player1.id);

        expect(game['players'][player1.id].ready).toBe(!readyStatus);
      });

      it('should set status to provided one', async () => {
        game.togglePlayerReady(player1.id, true);

        expect(game['players'][player1.id].ready).toBe(true);

        game.togglePlayerReady(player1.id, false);

        expect(game['players'][player1.id].ready).toBe(false);
      });
    });

    it('stops lobby countdown if not all players are ready', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      game.togglePlayerReady(player1.id);

      expect(game['lobbyCountDown']).toBeNull();

      game.togglePlayerReady(player2.id);

      const timeout = game['lobbyCountDown'];

      expect(setTimeoutSpy).toBeCalled();
      expect(typeof timeout).toBe('number');
      expect(game['gameStage']).toBe(GameStages.LOBBY_COUNTDOWN);

      game.togglePlayerReady(player2.id);

      expect(clearTimeoutSpy).toHaveBeenLastCalledWith(timeout);
      expect(game['lobbyCountDown']).toBeNull();
      expect(game['gameStage']).toBe(GameStages.LOBBY);
    });
  });

  describe('Phase: LOBBY', () => {
    let game: Game;

    beforeEach(async () => {
      game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);
    });

    it('should start next phase transition when all players become ready', () => {
      expect(game['gameStage']).toBe(GameStages.LOBBY);
      expect(game['lobbyCountDown']).toBeNull();

      game.togglePlayerReady(player1.id);
      game.togglePlayerReady(player2.id);

      const timeout = game['lobbyCountDown'];

      expect(game['gameStage']).toBe(GameStages.LOBBY_COUNTDOWN);
      expect(typeof timeout).toBe('number');
    });

    it('should send correct data to client', () => {
      const payload = game.getGameInfoPayload();

      expect(payload).toStrictEqual({
        id: game.id,
        gameStage: game['gameStage'],
        players: expect.anything(),
      });
    });
  });

  // transition LOBBY_COUNTDOWN -> QUESTIONS
  describe('Phase: LOBBY_COUNTDOWN', () => {
    let game: Game;

    beforeEach(async () => {
      game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      game.togglePlayerReady(player1.id);
      game.togglePlayerReady(player2.id);
    });

    it('should cancel transition if any player is no longer ready', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const timeout = game['lobbyCountDown'];

      game.togglePlayerReady(player1.id);

      expect(clearTimeoutSpy).toHaveBeenLastCalledWith(timeout);
      expect(game['lobbyCountDown']).toBeNull();
      expect(game['gameStage']).toBe(GameStages.LOBBY);
    });

    it('should cancel transition if any player disconnects', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const timeout = game['lobbyCountDown'];

      game.addDisconnectedPlayer(player1.id);

      expect(clearTimeoutSpy).toHaveBeenLastCalledWith(timeout);
      expect(game['lobbyCountDown']).toBeNull();
      expect(game['gameStage']).toBe(GameStages.LOBBY);
    });

    it('should cancel transition if any player leaves game', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const timeout = game['lobbyCountDown'];

      game.removePlayerFromGame(player1.id);

      expect(clearTimeoutSpy).toHaveBeenLastCalledWith(timeout);
      expect(game['lobbyCountDown']).toBeNull();
      expect(game['gameStage']).toBe(GameStages.LOBBY);
    });

    it('should mark all players as not ready if any player leaves game', () => {
      game.removePlayerFromGame(player1.id);

      const allNotReady = Object.values(game['players']).every(p => !p.ready);

      expect(allNotReady).toBe(true);
    });

    it('should send correct data to client', () => {
      const payload = game.getGameInfoPayload();

      expect(payload).toStrictEqual({
        id: game.id,
        gameStage: game['gameStage'],
        players: expect.anything(),
      });
    });
  });

  describe('Phase: QUESTIONS', () => {
    let game: Game;

    beforeEach(async () => {
      game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      game.togglePlayerReady(player1.id);
      game.togglePlayerReady(player2.id);

      jest.runOnlyPendingTimers();

      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    it('should set correct stage', () => {
      expect(game['gameStage']).toBe(GameStages.QUESTIONS);
    });

    it('should prepare current round question', () => {
      expect(game['currentQuestion']).toBe(1);
      expect(game['sanitizedQuestion']).not.toBeNull();
    });

    // check order of timers
    xit('should start next phase transition', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      expect(game['gameStage']).toBe(GameStages.QUESTIONS);
      expect(typeof game['questionCountdown']).toBe('number');
      expect(setTimeoutSpy).toBeCalledWith(
        expect.any(Function),
        NEXT_QUESTION_COUNTDOWN
      );
    });

    it('should send correct data to client', () => {
      const payload = game.getGameInfoPayload();

      expect(payload).toStrictEqual({
        id: game.id,
        gameStage: game['gameStage'],
        players: expect.anything(),
        questionNumber: 1,
        question: game['sanitizedQuestion'],
      });

      game.updateGameInfo();

      expect(io.emit).toHaveBeenLastCalledWith(GAME_INFO, payload);
    });

    it("should save player's answer", () => {
      const answers = ['test answer', 'another answer'];

      game.registerAnswer(player1.id, answers[0]);

      expect(game['players'][player1.id].answers).toHaveProperty(
        '1',
        answers[0]
      );

      game.registerAnswer(player2.id, answers[1]);

      Object.values(game['players']).forEach(player =>
        expect(player.answers[1]).toBeDefined()
      );
    });

    it('should fastforward current transition if all players gave answer', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const timeout = game['questionCountdown'];

      (io.emit as any).mockClear();

      game.registerAnswer(player1.id, 'a');
      game.registerAnswer(player2.id, 'b');

      expect(clearTimeoutSpy).lastCalledWith(timeout);
      expect(game['questionCountdown']).toBeNull();
      expect(game['gameStage']).toBe(GameStages.INTERMEDIATE_RESULTS);
      expect(io.emit).toBeCalledWith(GAME_INFO, expect.any(Object));
    });
  });

  describe('Phase: INTERMEDIATE_RESULTS', () => {
    let game: Game;

    beforeEach(async () => {
      game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      game.togglePlayerReady(player1.id);
      game.togglePlayerReady(player2.id);

      // LOBBY -> QUESTIONS
      jest.runOnlyPendingTimers();

      game.registerAnswer(player1.id, 'a');

      // QUESTIONS -> INTERMEDIATE_RESULTS
      jest.runOnlyPendingTimers();
    });

    it('should send correct data to client', () => {
      const payload = game.getGameInfoPayload();

      expect(game['gameStage']).toBe(GameStages.INTERMEDIATE_RESULTS);

      expect(payload).toStrictEqual({
        id: game.id,
        gameStage: game['gameStage'],
        players: expect.anything(),
        questionNumber: 1,
        question: game['sanitizedQuestion'],
        correctAnswer: game['questions'][0].correct_answer,
      });

      game.updateGameInfo();

      expect(io.emit).toHaveBeenLastCalledWith(GAME_INFO, payload);
    });

    it('should start next phase transition', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      expect(typeof game['questionResultsCountdown']).toBe('number');
      expect(setTimeoutSpy).toBeCalledWith(
        expect.any(Function),
        INTERMEDIATE_RESULTS_VISIBILITY_TIME
      );

      // INTERMEDIATE_RESULTS -> ROUND_END_RESULTS
      jest.runOnlyPendingTimers();

      expect(game['gameStage']).toBe(GameStages.ROUND_END_RESULTS);
    });
  });

  describe('Phase: ROUND_END_RESULTS', () => {
    let game: Game;

    beforeEach(async () => {
      game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      game.togglePlayerReady(player1.id);
      game.togglePlayerReady(player2.id);

      // LOBBY -> QUESTIONS
      jest.runOnlyPendingTimers();

      game.registerAnswer(player1.id, 'a');

      // QUESTIONS -> INTERMEDIATE_RESULTS
      jest.runOnlyPendingTimers();

      // INTERMEDIATE_RESULTS -> ROUND_END_RESULTS
      jest.runOnlyPendingTimers();
    });

    it('should send correct data to client', () => {
      const payload = game.getGameInfoPayload();

      expect(game['gameStage']).toBe(GameStages.ROUND_END_RESULTS);

      expect(payload).toStrictEqual({
        id: game.id,
        gameStage: game['gameStage'],
        players: expect.anything(),
        questionNumber: 1,
      });

      Object.values(payload.players).forEach(p => {
        expect(p.answer).toHaveProperty('text');
        expect(p.answer).toHaveProperty('isCorrect');
      });

      game.updateGameInfo();

      expect(io.emit).toHaveBeenLastCalledWith(GAME_INFO, payload);
    });

    describe('-> next question', () => {
      it('should set correct stage', () => {
        // ROUND_END_RESULTS -> QUESTIONS (2)
        jest.runOnlyPendingTimers();

        expect(game['gameStage']).toBe(GameStages.QUESTIONS);
      });

      it('should prepare current round question', () => {
        const question = game['sanitizedQuestion'].question;

        // ROUND_END_RESULTS -> QUESTIONS (2)
        jest.runOnlyPendingTimers();

        expect(game['currentQuestion']).toBe(2);
        expect(game['sanitizedQuestion'].question).not.toBe(question);
      });

      it('should start next phase transition', () => {
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

        // ROUND_END_RESULTS -> QUESTIONS (2)
        jest.runOnlyPendingTimers();

        expect(typeof game['questionCountdown']).toBe('number');
        expect(setTimeoutSpy).lastCalledWith(
          expect.any(Function),
          NEXT_QUESTION_COUNTDOWN
        );
      });
    });

    describe('-> end game', () => {
      beforeEach(() => {
        // ROUND_END_RESULTS -> QUESTIONS (2)
        jest.runOnlyPendingTimers();
        // QUESTIONS (2) -> INTERMEDIATE_RESULTS
        jest.runOnlyPendingTimers();
        // INTERMEDIATE_RESULTS -> ROUND_END_RESULTS
        jest.runOnlyPendingTimers();
        // ROUND_END_RESULTS -> GAME_OVER
        jest.runOnlyPendingTimers();
      });

      it('should set correct stage', () => {
        expect(game['gameStage']).toBe(GameStages.GAME_OVER);
      });

      it('should send correct data to client', () => {
        const payload = game.getGameInfoPayload();

        expect(payload).toStrictEqual({
          id: game.id,
          gameStage: game['gameStage'],
          players: expect.anything(),
          results: expect.anything(),
        });

        game.updateGameInfo();

        expect(io.emit).toHaveBeenLastCalledWith(GAME_INFO, payload);
      });
    });
  });

  describe('Phase: GAME_OVER', () => {
    let game: Game;

    beforeEach(async () => {
      game = await new Game(normalGameConfig, player1.id);

      game.addPlayer(player1.id);
      game.addPlayer(player2.id);

      game.togglePlayerReady(player1.id);
      game.togglePlayerReady(player2.id);

      // LOBBY -> QUESTIONS
      jest.runOnlyPendingTimers();

      game.registerAnswer(player1.id, 'a');

      // QUESTIONS -> INTERMEDIATE_RESULTS
      jest.runOnlyPendingTimers();

      // INTERMEDIATE_RESULTS -> ROUND_END_RESULTS
      jest.runOnlyPendingTimers();

      // ROUND_END_RESULTS -> QUESTIONS (2)
      jest.runOnlyPendingTimers();
      // QUESTIONS (2) -> INTERMEDIATE_RESULTS
      jest.runOnlyPendingTimers();
      // INTERMEDIATE_RESULTS -> ROUND_END_RESULTS
      jest.runOnlyPendingTimers();
    });

    it('expect to kick all players from game after game over', async () => {
      const kickAllPlayersTimeout = jest.spyOn(global, 'setTimeout');

      // ROUND_END_RESULTS -> GAME_OVER
      jest.runOnlyPendingTimers();

      expect(kickAllPlayersTimeout).toBeCalledWith(
        expect.any(Function),
        KICK_ALL_PLAYERS_TIME
      );

      // GAME OVER -> KILL GAME
      jest.runOnlyPendingTimers();

      expect(Object.keys(game['players']).length).toEqual(0);

      expect(socket1.emit).toBeCalledWith(KILL_GAME, {
        message: `sorry dude, but this game ${
          game.id
        } is over for you and your friends`,
      });

      expect(socket2.emit).toBeCalledWith(KILL_GAME, {
        message: `sorry dude, but this game ${
          game.id
        } is over for you and your friends`,
      });

      expect(Game.Games).not.toHaveProperty(game.id);
    });
  });
});
