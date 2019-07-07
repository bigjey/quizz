import * as React from 'react';

import { setPlayerName } from '../../utils/storage';
import { useAppState } from '../../hooks/useAppState';

import { NewPlayer } from './NewPlayer';

export const NewPlayerContainer = () => {
  const { setAppState } = useAppState();
  const nameInput = React.useRef(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.current.value.trim();

    if (name.length) {
      setAppState(state => ({
        ...state,
        playerName: name,
      }));
      setPlayerName(name);
    }
  };

  return <NewPlayer onSubmit={onSubmit} inputRef={nameInput} />;
};
