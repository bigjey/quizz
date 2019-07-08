import './Games.scss';

import * as React from 'react';

import { Button } from '../UI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faGhost } from '@fortawesome/free-solid-svg-icons';
import { GamesListItem } from '../../../../shared/types';
import { PlayerInfoContainer } from '../PlayerInfo';

interface GamesProps {
  games: GamesListItem[];
  onJoinGameClick(gameId: string): void;
  onNewGameClick(): void;
}

const Games: React.FC<GamesProps> = ({
  games,
  onJoinGameClick,
  onNewGameClick,
}) => {
  const GameItem: React.FC<GamesListItem> = ({
    id,
    playersCount,
    maxPlayers,
  }) => (
    <div className="Games--game" onClick={() => onJoinGameClick(id)}>
      <div className="Games--game-details">
        <div className="Games--game-name">{id}</div>
        <div className="Games--game-meta">
          {playersCount} / {maxPlayers}
        </div>
      </div>
      <div className="Games--game-actions">
        <Button className="Games--game-join" variant="small">
          Join
        </Button>
      </div>
    </div>
  );

  return (
    <div className="Games screen">
      <PlayerInfoContainer />
      <div className="Games--list">
        {games.length === 0 && (
          <div className="Games--empty">
            <FontAwesomeIcon icon={faGhost} />
            <br />
            There are no available games at the moment
          </div>
        )}
        {games.map((g: GamesListItem) => (
          <GameItem key={g.id} {...g} />
        ))}
      </div>
      <div className="Games--footer">
        <Button full variant="big" color="green" onClick={onNewGameClick}>
          <FontAwesomeIcon icon={faPlus} /> New Game
        </Button>
      </div>
    </div>
  );
};

export { Games };
