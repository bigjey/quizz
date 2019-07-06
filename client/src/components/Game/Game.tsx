import * as React from 'react';
import { socket } from '../../socket';

import { LEAVE_GAME } from '../../../../shared/client-events';
import { useAppState } from '../../hooks/useAppState';

export const Game = () => {
  const { appState, setAppState } = useAppState();
  
  const onLeaveHandler = () => {
    socket.emit(LEAVE_GAME, appState.gameId);
    setAppState({
      ...appState,
      gameId: null
    })
  };

  if (!appState.gameId) {
    return null;
  }

  return (
    <>
      <div>game #{appState.gameId}</div>
      <button onClick={onLeaveHandler}>Leave stupid game</button>
    </>
  );
};
