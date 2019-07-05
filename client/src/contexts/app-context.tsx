import * as React from 'react';

import { getPlayerId, getPlayerName } from '../utils/storage';

const defaultState = () => {
  return {
    playerId: getPlayerId(),
    playerName: getPlayerName(),
    games: [],
    gameId: null
  };
};

export const AppContext = React.createContext(null);

export const AppStateProvider = (props) => {
  const [appState, setAppState] = React.useState(defaultState());

  const value = {
    appState,
    setAppState
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
