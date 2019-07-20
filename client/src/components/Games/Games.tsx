import './Games.scss';

import * as React from 'react';

import { Button, Modal } from '../UI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faGhost, faCheck } from '@fortawesome/free-solid-svg-icons';
import { GamesListItem, IGameConfig } from '../../../../shared/types';
import { PlayerInfoContainer } from '../PlayerInfo';
import { ConfigForm } from '../ConfigForm';

interface GamesProps {
  games: GamesListItem[];
  onJoinGameClick(gameId: string): void;
  onNewGameClick(config: IGameConfig): void;
}

const Games: React.FC<GamesProps> = ({
  games,
  onJoinGameClick,
  onNewGameClick,
}) => {
  const [isModalActive, toggleModal] = React.useState(false);

  const GameItem: React.FC<GamesListItem> = ({
    id,
    config,
    hostName,
    playersCount,
  }) => (
    <div className="Games--game" onClick={() => onJoinGameClick(id)}>
      <div className="Games--game-details">
        <div className="Games--game-name">
          {name ? (
            name
          ) : hostName ? (
            <>
              {hostName}
              <span className="Games--game-host">#{id}</span>
            </>
          ) : (
            id
          )}{' '}
          ({playersCount}/{config.maxPlayers})
        </div>
        <div className="Games--game-meta">
          <div className="Games--game-meta-box">
            <span>difficulty:</span>{' '}
            {config.difficulty ? config.difficulty : 'Any'}
          </div>
          <div className="Games--game-meta-box">
            <span>category:</span>{' '}
            {config.category ? config.category.name : 'Any'}
          </div>
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
        <Button
          full
          variant="big"
          color="green"
          onClick={() => {
            toggleModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> New Game
        </Button>
        <Modal onClose={() => toggleModal(false)} open={isModalActive}>
          {({ closeModal }) => (
            <>
              <Modal.Header
                style={{
                  fontSize: 24,
                }}
              >
                Lorem ipsum
              </Modal.Header>
              <Modal.Body>
                <ConfigForm
                  closeModal={closeModal}
                  onSubmitHandler={onNewGameClick}
                />
              </Modal.Body>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export { Games };
