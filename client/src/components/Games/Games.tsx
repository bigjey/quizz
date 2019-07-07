import './Games.scss';

import * as React from 'react';

import { Button } from '../UI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export const Games = ({ games, onJoinGameClick, onNewGameClick }) => {
  return (
    <div className="Games screen">
      <div className="Games--list">
        {games.map(g => (
          <div key={g}>
            {g} <button onClick={() => onJoinGameClick(g)}>Join</button>
          </div>
        ))}
      </div>
      <div className="Games--footer">
        <Button full variant="big" onClick={onNewGameClick}>
          <FontAwesomeIcon icon={faPlus} /> New Game
        </Button>
      </div>
    </div>
  );
};
