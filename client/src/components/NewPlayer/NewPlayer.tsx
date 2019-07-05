import './NewPlayer.css';

import * as React from 'react';

import { setPlayerName } from '../../utils/storage';
import { useAppState } from '../../hooks/useAppState';

export const NewPlayer = () => {
  const { setAppState } = useAppState();
  const nameInput = React.useRef(null);

  const onSubmit = (e) => {
    e.preventDefault();
    const name = nameInput.current.value.trim();

    if (name.length) {
      setAppState((state) => ({
        ...state,
        playerName: name
      }));
      setPlayerName(name);
    }
  };

  return (
    <>
      <form className="NewPlayer" onSubmit={onSubmit}>
        <input
          className="NewPlayer--input"
          type="text"
          ref={nameInput}
          placeholder="Give us your name, player"
        />
        <button className="NewPlayer--button">Join</button>
      </form>
    </>
  );
};
