import * as React from 'react';

import { useAppState } from '../../hooks/useAppState';

export const Game = () => {
  const { appState } = useAppState();

  if (!appState.gameId) {
    return null;
  }

  return (
    <>
      <div>game #{appState.gameId}</div>
    </>
  );
};
