import * as React from 'react';

import { socket } from '../../socket';
import { useAppState } from '../../hooks/useAppState';

export const Games = () => {
  const { appState } = useAppState();
  const [games, setGames] = React.useState([]);

  React.useEffect(() => {
    if (appState.gameId) return;

    const onGamesUpdate = (games) => {
      setGames(games);
    };

    socket.on('games', onGamesUpdate);

    return () => {
      socket.off('games', onGamesUpdate);
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
            socket.emit('new-game');
          }}
        >
          New Game
        </button>
      </div>
      <div>
        {games.map((g) => (
          <div key={g}>
            {g}{' '}
            <button
              onClick={() => {
                socket.emit('join-game', g);
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
