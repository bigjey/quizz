import * as React from 'react';

import { useAppState } from '../../hooks/useAppState';

import { NewPlayerContainer } from '../NewPlayer';
import { Games } from '../Games';
import { Game } from '../Game';

import { socket } from '../../socket';
import { NEW_PLAYER } from '../../../../shared/client-events';
import { JOINED_GAME } from '../../../../shared/server-events';

export const App = () => {
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

    socket.on(JOINED_GAME, onJoinedGame);

    return () => {
      socket.off(JOINED_GAME, onJoinedGame);
    };
  }, []);

  return (
    <>
      {playerName ? (
        <>
          Player: {playerName}#{playerId}
          <Games />
          <Game />
        </>
      ) : (
        <NewPlayerContainer />
      )}
    </>
  );
};
