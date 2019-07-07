import './Games.scss';

import * as React from 'react';

import { socket } from '../../socket';
import { useAppState } from '../../hooks/useAppState';
import { GAMES_DATA } from '../../../../shared/server-events';
import { NEW_GAME, JOIN_GAME } from '../../../../shared/client-events';
import { GamesDataPayload } from '../../../../shared/types';

import { Games } from './Games';

export const GamesContainer = () => {
  const { appState } = useAppState();

  if (appState.gameId) {
    return null;
  }

  return (
    <Games
      games={appState.games}
      onNewGameClick={() => {
        socket.emit(NEW_GAME);
      }}
      onJoinGameClick={g => {
        socket.emit(JOIN_GAME, g);
      }}
    />
  );
};
