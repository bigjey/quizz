import './Game.scss';

import * as React from 'react';
import { socket } from '../../socket';

import {
  LEAVE_GAME,
  TOGGLE_READY,
  PLAYER_ANSWER,
} from '../../../../shared/client-events';
import { PLAYER_LEFT } from '../../../../shared/server-events';
import { useAppState } from '../../hooks/useAppState';
import { PlayerInfoContainer } from '../PlayerInfo';
import { Button, CircleProgress, Countdown } from '../UI';
import { GameStages } from '../../../../shared/types';

const Game = () => {
  const { appState, setAppState } = useAppState();
  const { gameInfo, gameId } = appState;

  const [answered, setAnswered] = React.useState(false);

  const round = gameInfo ? gameInfo.questionNumber : null;

  React.useEffect(() => {
    const onPlayerLeft = message => {
      console.log(message);
    };
    socket.on(PLAYER_LEFT, onPlayerLeft);

    return () => {
      socket.off(PLAYER_LEFT, onPlayerLeft);
    };
  }, []);

  React.useEffect(() => {
    setAnswered(false);
  }, [round]);

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

  if (!player) return null;

  return (
    <div className="Game screen">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div className="Game--info">
          <div>
            game #{gameId} ({gameInfo.gameStage})
          </div>
          <button onClick={onLeaveHandler}>Leave stupid game</button>
        </div>
        <PlayerInfoContainer />
      </div>

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

      {(gameInfo.gameStage === GameStages.LOBBY ||
        gameInfo.gameStage === GameStages.LOBBY_COUNTDOWN) && (
        <>
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
        </>
      )}

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

      {gameInfo.gameStage === GameStages.QUESTIONS && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              margin: '10px 0',
              color: '#777',
            }}
          >
            Round {gameInfo.questionNumber}
          </div>
          <h2>{gameInfo.question.question}</h2>
          <br />
          <div className="Game--answers">
            {gameInfo.question.answers.map(text => (
              <Button
                disabled={answered}
                dangerouslySetInnerHTML={{ __html: text }}
                onClick={() => {
                  socket.emit(PLAYER_ANSWER, text);
                  setAnswered(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {gameInfo.gameStage === GameStages.RESULTS && (
        <div>
          {gameInfo.players.map(p => (
            <div>
              {p.name}: {p.answer}
            </div>
          ))}
        </div>
      )}

      {gameInfo.gameStage === GameStages.GAME_OVER && (
        <div>
          {gameInfo.players.map(p => (
            <>
              {p.name}
              <ol>
                {Object.values(p.answers).map(text => (
                  <li dangerouslySetInnerHTML={{ __html: text }} />
                ))}
              </ol>
            </>
          ))}
        </div>
      )}

      {(gameInfo.gameStage === GameStages.LOBBY ||
        gameInfo.gameStage === GameStages.LOBBY_COUNTDOWN) && (
        <Button onClick={onReadyHandler}>
          {player.ready ? 'I am not ready yet' : 'I am Ready'}
        </Button>
      )}
    </div>
  );
};

export { Game };
