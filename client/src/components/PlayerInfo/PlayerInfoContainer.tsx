import * as React from 'react';
import { PlayerInfo } from './PlayerInfo';
import { useAppState } from '../../hooks/useAppState';

const PlayerInfoContainer = () => {
  const { appState } = useAppState();

  return <PlayerInfo name={appState.playerName} />;
};

export { PlayerInfoContainer };
