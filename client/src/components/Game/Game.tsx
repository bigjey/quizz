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

  const [playerAnswer, setPlayerAnswer] = React.useState(null);

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
    setPlayerAnswer(null);
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

      {/* <pre>{JSON.stringify(gameInfo, null, 2)}</pre> */}

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

      {(gameInfo.gameStage === GameStages.QUESTIONS ||
        gameInfo.gameStage === GameStages.INTERMEDIATE_RESULTS) && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              margin: '10px 0',
              color: '#777',
            }}
          >
            Round {gameInfo.questionNumber}
          </div>
          <h2
            dangerouslySetInnerHTML={{ __html: gameInfo.question.question }}
          />
          <br />
          <div className="Game--answers">
            {gameInfo.question.answers.map(text => {
              const styles: any = {};
              if (gameInfo.gameStage === GameStages.INTERMEDIATE_RESULTS) {
                if (text === gameInfo.correctAnswer) {
                  styles.backgroundColor = 'green';
                } else if (text === playerAnswer) {
                  styles.backgroundColor = 'red';
                }
              } else if (gameInfo.gameStage === GameStages.QUESTIONS) {
                if (text === playerAnswer) {
                  styles.backgroundColor = 'blue';
                }
              }
              return (
                <Button
                  disabled={playerAnswer}
                  dangerouslySetInnerHTML={{ __html: text }}
                  style={styles}
                  onClick={() => {
                    socket.emit(PLAYER_ANSWER, text);
                    setPlayerAnswer(text);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {gameInfo.gameStage === GameStages.ROUND_END_RESULTS && (
        <div>
          {gameInfo.players.map(p => (
            <div>
              {p.name}: {p.answer.text} (
              {p.answer.isCorrect ? 'Correct' : 'Wrong'})
            </div>
          ))}
        </div>
      )}

      {gameInfo.gameStage === GameStages.GAME_OVER && (
        <ol style={{ padding: 16 }}>
          {gameInfo.results.map(r => (
            <li>
              {r.name}: {r.score}
            </li>
          ))}
        </ol>
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
