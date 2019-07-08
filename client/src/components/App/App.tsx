import * as React from 'react';

import { useAppState } from '../../hooks/useAppState';

import { NewPlayerContainer } from '../NewPlayer';
import { Game } from '../Game';
import { GamesContainer } from '../Games';

import { socket } from '../../socket';
import { NEW_PLAYER } from '../../../../shared/client-events';
import {
  JOINED_GAME,
  GAMES_DATA,
  GAME_INFO,
} from '../../../../shared/server-events';

import { GamesDataPayload } from '../../../../shared/types';

const App = () => {
  const { appState, setAppState } = useAppState();

  const { playerName, playerId } = appState;

  React.useEffect(() => {
    if (playerName && playerId) {
      socket.emit(NEW_PLAYER, {
        id: playerId,
        name: playerName,
      });
    }
  }, [playerName, playerId]);

  React.useEffect(() => {
    const onJoinedGame = gameId => {
      setAppState(state => ({
        ...state,
        gameId,
      }));
    };

    const onGameInfo = gameData => {
      setAppState(state => ({
        ...state,
        gameInfo: gameData,
      }));
    };

    const onGamesUpdate = (games: GamesDataPayload) => {
      setAppState(state => ({
        ...state,
        games,
      }));
    };

    socket.on(JOINED_GAME, onJoinedGame);
    socket.on(GAMES_DATA, onGamesUpdate);
    socket.on(GAME_INFO, onGameInfo);

    return () => {
      socket.off(JOINED_GAME, onJoinedGame);
      socket.off(GAMES_DATA, onGamesUpdate);
      socket.off(GAME_INFO, onGameInfo);
    };
  }, []);

  return (
    <>
      {playerName ? (
        <>
          <GamesContainer />
          <Game />
        </>
      ) : (
        <NewPlayerContainer />
      )}
    </>
  );
};

export { App };
