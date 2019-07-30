import './Games.scss';

import * as React from 'react';

import { socket } from '../../socket';
import { useAppState } from '../../hooks/useAppState';
import { GAMES_DATA, GAME_IS_KILLED } from '../../../../shared/server-events';
import { NEW_GAME, JOIN_GAME } from '../../../../shared/client-events';
import { GamesDataPayload, IGameConfig } from '../../../../shared/types';

import { Games } from './Games';

const GamesContainer = () => {
  const { appState, setAppState } = useAppState();
  const { games } = appState;

  // const activeGames = games.length ? games.length : 0;

  React.useEffect(() => {
    const onGameKilled = message => {
      console.log('Game was destroyed: ', message);
    };

    socket.on(GAME_IS_KILLED, onGameKilled);
  }, [games]);

  console.log(games);
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
