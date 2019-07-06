import './Game.scss';

import * as React from 'react';
import { socket } from '../../socket';

import { LEAVE_GAME } from '../../../../shared/client-events';
import { GAME_INFO, PLAYER_LEFT } from '../../../../shared/server-events';
import { useAppState } from '../../hooks/useAppState';

export const Game = () => {
  const { appState, setAppState } = useAppState();
  const [gameInfo, setGameInfo] = React.useState(null);

  React.useEffect(() => {
    const onGameInfo = gameData => {
      setGameInfo(gameData);
    };

    const onPlayerLeft = message => {
      console.log(message);
    };

    socket.on(GAME_INFO, onGameInfo);
    socket.on(PLAYER_LEFT, onPlayerLeft);

    return () => {
      socket.off(GAME_INFO, onGameInfo);
      socket.off(PLAYER_LEFT, onPlayerLeft);
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
    <div className="Game">
      {gameInfo.disconnectedPlayers.length > 0 && (
        <div className="Game--splash">
          <div>
            Ooops, player(s) are trying to reconnect:
            {gameInfo.disconnectedPlayers.map(playerId => (
              <div key={playerId}>{playerId}</div>
            ))}
          </div>
        </div>
      )}
      <pre>{JSON.stringify(gameInfo, null, 2)}</pre>
      <div>game #{appState.gameId}</div>
      <button onClick={onLeaveHandler}>Leave stupid game</button>
    </div>
  );
};
