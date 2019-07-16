import './Game.scss';

import * as React from 'react';
import { socket } from '../../socket';

import { LEAVE_GAME, TOGGLE_READY } from '../../../../shared/client-events';
import { PLAYER_LEFT } from '../../../../shared/server-events';
import { useAppState } from '../../hooks/useAppState';
import { PlayerInfoContainer } from '../PlayerInfo';
import { Button, CircleProgress, Countdown } from '../UI';
import { GameStages } from '../../../../shared/types';

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

  const onReadyHandler = () => {
    socket.emit(TOGGLE_READY, appState.gameId);
  };

  if (!gameId || !gameInfo) {
    return null;
  }

  const disconnected = gameInfo.players.filter(p => p.disconnected);
  const player = gameInfo.players.find(p => p.id === appState.playerId);
  const totalPlayers = gameInfo.players.length;
  const readyPlayers = gameInfo.players.filter(p => p.ready).length;

  return (
    <div className="Game screen">
      <PlayerInfoContainer />
      <div>
        game #{gameId} ({gameInfo.gameStage})
      </div>
      <button onClick={onLeaveHandler}>Leave stupid game</button>
      {disconnected.length > 0 && (
        <div className="Game--splash">
          <div>
            Ooops, player(s) are trying to reconnect:
            {disconnected.map(player => (
              <div key={player.id}>{player.name}</div>
            ))}
          </div>
        </div>
      )}
      {gameInfo.players.map(player => (
        <div key={player.id}>
          {player.name}
          <input type="checkbox" checked={player.ready} readOnly />
          {player.disconnected && '(disconnected)'}
        </div>
      ))}
      <div className="Game--players--counter">
        {`${readyPlayers} / ${totalPlayers}`}
      </div>
      {gameInfo.gameStage === GameStages.LOBBY_COUNTDOWN && (
        <Countdown
          start={5}
          end={0}
          render={v => (
            <>
              {v}
              <CircleProgress reverse percentage={v * 20} />
            </>
          )}
        />
      )}
      <Button onClick={onReadyHandler}>
        {player.ready ? 'I am not ready yet' : 'I am Ready'}
      </Button>
    </div>
  );
};

export { Game };
