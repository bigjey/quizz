import React from 'react';
import { render } from 'react-dom';

import { Page } from './components/Page';
import { NewPlayer } from './components/NewPlayer';
import { Button } from './components/UI';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Example = ({ name = null, children }) => (
  <div style={{ margin: '10px 0' }}>
    {name !== null && <div style={{ marginBottom: 5 }}>{name}</div>}
    {children}
  </div>
);

render(
  <Page>
    <NewPlayer />

    <Example name="Button">
      <Button>Button</Button>
    </Example>

    <Example name="Button color">
      <Button>Button</Button>
      <Button color="green">Button</Button>
      <Button color="blue">Button</Button>
    </Example>

    <Example name="Button variant">
      <Button variant="small">Button</Button>
      <Button>Button</Button>
      <Button variant="big">Button</Button>
    </Example>

    <Example name="Button small">
      <Button variant="small">Button</Button>
    </Example>

    <Example name="Disabled Button">
      <Button disabled>
        <FontAwesomeIcon icon={faPlus} /> Test2
      </Button>
    </Example>

    <Example name="Full width Button">
      <Button full>
        Test2 <FontAwesomeIcon icon={faPlus} />
      </Button>
    </Example>

    <Example name="Button">
      <Button variant="big">
        Enough text for two columns, i swear <FontAwesomeIcon icon={faPlus} />
      </Button>
    </Example>
  </Page>,
  document.getElementById('app')
);
