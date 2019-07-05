import * as React from 'react';

import { useAppState } from '../../hooks/useAppState';

import { NewPlayer } from '../NewPlayer';
import { Games } from '../Games';
import { Game } from '../Game';

import { socket } from '../../socket';

export const App = () => {
  const { appState, setAppState } = useAppState();

  const { playerName, playerId } = appState;

  React.useEffect(() => {
    if (playerName && playerId) {
      socket.emit('new-player', {
        id: playerId,
        name: playerName
      });
    }
  }, [playerName, playerId]);

  React.useEffect(() => {
    const onJoinedGame = (gameId) => {
      setAppState((state) => ({
        ...state,
        gameId
      }));
    };

    socket.on('joined-game', onJoinedGame);

    return () => {
      socket.off('joined-game', onJoinedGame);
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
        <NewPlayer />
      )}
    </>
  );
};
