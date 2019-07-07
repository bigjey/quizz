import React from 'react';
import { render } from 'react-dom';

import { Page } from '../src/components/Page';
import { NewPlayer } from '../src/components/NewPlayer';

render(
  <Page>
    <NewPlayer />
    <NewPlayer />
    <NewPlayer />
  </Page>,
  document.getElementById('app')
);
