import './Game.scss';

import * as React from 'react';
import { socket } from '../../socket';

import { LEAVE_GAME } from '../../../../shared/client-events';
import { PLAYER_LEFT } from '../../../../shared/server-events';
import { useAppState } from '../../hooks/useAppState';
import { PlayerInfoContainer } from '../PlayerInfo';

const Game = () => {
  const { appState, setAppState } = useAppState();
  const { gameInfo, gameId } = appState;

  React.useEffect(() => {
    const onPlayerLeft = message => {
      console.log(message);
    };
    socket.on(PLAYER_LEFT, onPlayerLeft);

    return () => {
      socket.off(PLAYER_LEFT, onPlayerLeft);
    };
  }, []);

  const onLeaveHandler = () => {
    socket.emit(LEAVE_GAME, gameId);
    setAppState({
      ...appState,
      gameId: null,
    });
  };

  if (!gameId || !gameInfo) {
    return null;
  }

  return (
    <div className="Game screen">
      <PlayerInfoContainer />
      <div>game #{gameId}</div>
      <button onClick={onLeaveHandler}>Leave stupid game</button>
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
    </div>
  );
};

export { Game };
