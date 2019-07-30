import './Games.scss';

import * as React from 'react';

import { socket } from '../../socket';
import { useAppState } from '../../hooks/useAppState';
import { GAMES_DATA } from '../../../../shared/server-events';
import { NEW_GAME, JOIN_GAME } from '../../../../shared/client-events';
import { GamesDataPayload, IGameConfig } from '../../../../shared/types';

import { Games } from './Games';

const GamesContainer = () => {
  const { appState } = useAppState();

  const onConfigFormSubmit = (config: IGameConfig) => {
    socket.emit(NEW_GAME, config);
  };

  if (appState.gameId) {
    return null;
  }

  return (
    <Games
      games={appState.games}
      onNewGameClick={onConfigFormSubmit}
      onJoinGameClick={g => {
        socket.emit(JOIN_GAME, g);
      }}
    />
  );
};

export { GamesContainer };
