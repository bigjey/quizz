import * as React from 'react';
import { render } from 'react-dom';

import { AppStateProvider } from './contexts/app-context';
import { App } from './components/App';

const root = document.getElementById('app');

render(
  <AppStateProvider>
    <App />
  </AppStateProvider>,
  root
);
