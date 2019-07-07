import './Games.scss';

import * as React from 'react';

import { socket } from '../../socket';
import { useAppState } from '../../hooks/useAppState';
import { GAMES_DATA } from '../../../../shared/server-events';
import { NEW_GAME, JOIN_GAME } from '../../../../shared/client-events';
import { Games } from './Games';

export const GamesContainer = () => {
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
    <Games
      games={games}
      onNewGameClick={() => {
        socket.emit(NEW_GAME);
      }}
      onJoinGameClick={g => {
        socket.emit(JOIN_GAME, g);
      }}
    />
  );
};
