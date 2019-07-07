import * as React from 'react';
import { render } from 'react-dom';

import { AppStateProvider } from './contexts/app-context';
import { App } from './components/App';
import { Page } from './components/Page';

const root = document.getElementById('app');

render(
  <AppStateProvider>
    <Page>
      <App />
    </Page>
  </AppStateProvider>,
  root
);
