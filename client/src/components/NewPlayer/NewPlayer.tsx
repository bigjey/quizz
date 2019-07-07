import './NewPlayer.css';

import * as React from 'react';

interface NewPlayerProps {
  onSubmit?(e: React.FormEvent): void;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const NewPlayer: React.FC<NewPlayerProps> = ({ onSubmit, inputRef }) => (
  <div className="NewPlayer screen">
    <form onSubmit={onSubmit}>
      <input
        className="NewPlayer--input"
        type="text"
        ref={inputRef}
        placeholder="Give us your name, player"
      />
      <button className="NewPlayer--button">Join</button>
    </form>
  </div>
);

NewPlayer.defaultProps = {
  onSubmit: () => {},
  inputRef: null,
};
