import { useContext } from 'react';
import { AppContext } from '../contexts/app-context';

export const useAppState = () => {
  const { appState, setAppState } = useContext(AppContext);

  return {
    appState,
    setAppState
  };
};
