import './NewPlayer.scss';

import * as React from 'react';
import { Input, Button } from '../UI';

interface NewPlayerProps {
  onSubmit?(value: string): void;
}

const NewPlayer: React.FC<NewPlayerProps> = ({ onSubmit }) => {
  const [value, setValue] = React.useState('');

  return (
    <form
      className="NewPlayer screen"
      onSubmit={e => {
        e.preventDefault();
        onSubmit && onSubmit(value);
      }}
    >
      <div className="NewPlayer--header">Welcome to Quizz</div>

      <div className="NewPlayer--content">
        <Input
          className="NewPlayer--input"
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value);
          }}
          placeholder="Player name"
        />
      </div>

      <div className="NewPlayer--footer">
        <div className="NewPlayer--text">
          Start playing by entering your name
        </div>
        <Button
          disabled={value.trim().length === 0}
          full
          variant="big"
          type="submit"
          className="NewPlayer--button"
        >
          Join
        </Button>
      </div>
    </form>
  );
};

NewPlayer.defaultProps = {
  onSubmit: () => {},
};

export { NewPlayer };
