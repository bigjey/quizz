import * as React from 'react';

import { getPlayerId, getPlayerName } from '../utils/storage';
import { GameInfoPayload, GamesDataPayload } from '../../../shared/types';

export interface AppState {
  playerId: string;
  playerName: string;
  games: GamesDataPayload;
  gameId: string;
  gameInfo: GameInfoPayload;
}

const defaultState = (): AppState => {
  return {
    playerId: getPlayerId(),
    playerName: getPlayerName(),
    games: [],
    gameId: null,
    gameInfo: null,
  };
};

const AppContext = React.createContext<{
  appState: AppState;
  setAppState: Function;
}>(null);

const AppStateProvider = props => {
  const [appState, setAppState] = React.useState(defaultState());

  const value = {
    appState,
    setAppState,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export { AppStateProvider, AppContext };
