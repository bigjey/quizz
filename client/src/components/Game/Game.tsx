import * as React from 'react';
import { socket } from '../../socket';

import { LEAVE_GAME } from '../../../../shared/client-events';
import { GAME_INFO } from '../../../../shared/server-events';
import { useAppState } from '../../hooks/useAppState';

export const Game = () => {
  const { appState, setAppState } = useAppState();
  const [gameInfo, setGameInfo] = React.useState(null);

  React.useEffect(() => {
    const onGameInfo = gameData => {
      setGameInfo(gameData);
    };
    socket.on(GAME_INFO, onGameInfo);

    return () => {
      socket.off(GAME_INFO, onGameInfo);
    };
  }, []);

  const onLeaveHandler = () => {
    socket.emit(LEAVE_GAME, appState.gameId);
    setAppState({
      ...appState,
      gameId: null,
    });
  };

  if (!appState.gameId) {
    return null;
  }

  return (
    <>
      <pre>{JSON.stringify(gameInfo, null, 2)}</pre>
      <div>game #{appState.gameId}</div>
      <button onClick={onLeaveHandler}>Leave stupid game</button>
    </>
  );
};
