import * as React from 'react';

import { socket } from '../../socket';
import { useAppState } from '../../hooks/useAppState';
import { NEW_GAME, JOIN_GAME } from '../../../../shared/client-events';
import { GAMES_DATA } from '../../../../shared/server-events';

export const Games = () => {
  const { appState } = useAppState();
  const [games, setGames] = React.useState([]);

  React.useEffect(() => {
    if (appState.gameId) return;

    const onGamesUpdate = games => {
      setGames(games);
    };

    socket.on(GAMES_DATA, onGamesUpdate);

    return () => {
      socket.off(GAMES_DATA, onGamesUpdate);
    };
  }, [appState.gameId]);

  if (appState.gameId) {
    return null;
  }

  return (
    <>
      <div>
        <button
          onClick={() => {
            socket.emit(NEW_GAME);
          }}
        >
          New Game
        </button>
      </div>
      <div>
        {games.map(g => (
          <div key={g}>
            {g}{' '}
            <button
              onClick={() => {
                socket.emit(JOIN_GAME, g);
              }}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
