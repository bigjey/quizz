import './PlayerInfo.scss';

import * as React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';

export const PlayerInfo = ({ name }) => (
  <div className="PlayerInfo">
    <FontAwesomeIcon icon={faGamepad} />
    <span className="PlayerInfo--name">{name}</span>
  </div>
);
