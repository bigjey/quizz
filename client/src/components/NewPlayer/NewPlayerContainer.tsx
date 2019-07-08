import * as React from 'react';

import { setPlayerName } from '../../utils/storage';
import { useAppState } from '../../hooks/useAppState';

import { NewPlayer } from './NewPlayer';

const NewPlayerContainer = () => {
  const { setAppState } = useAppState();

  const onSubmit = name => {
    setAppState(state => ({
      ...state,
      playerName: name,
    }));
    setPlayerName(name);
  };

  return <NewPlayer onSubmit={onSubmit} />;
};

export { NewPlayerContainer };
