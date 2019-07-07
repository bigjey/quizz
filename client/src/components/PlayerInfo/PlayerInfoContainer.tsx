import * as React from 'react';
import { PlayerInfo } from './PlayerInfo';
import { useAppState } from '../../hooks/useAppState';

export const PlayerInfoContainer = () => {
  const { appState } = useAppState();

  return <PlayerInfo name={appState.playerName} />;
};
