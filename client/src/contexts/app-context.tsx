import * as React from 'react';

import { getPlayerId, getPlayerName } from '../utils/storage';

const defaultState = () => {
  return {
    playerId: getPlayerId(),
    playerName: getPlayerName(),
    games: [],
    gameId: null,
  };
};

const AppContext = React.createContext(null);

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
