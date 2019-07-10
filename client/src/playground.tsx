import React from 'react';
import { render } from 'react-dom';

import { Page } from './components/Page';
import { NewPlayer } from './components/NewPlayer';
import { Button, Modal } from './components/UI';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CircleProgress } from './components/UI/CircleProgress';

const Example = ({ name = null, children }) => (
  <div style={{ margin: '10px 0' }}>
    {name !== null && <div style={{ marginBottom: 5 }}>{name}</div>}
    {children}
  </div>
);

const Countdown = ({
  start = 10,
  end = 0,
  step = 1,
  interval = 1000,
  render,
}) => {
  const [value, setValue] = React.useState(start);
  const v = React.useRef(start);

  React.useEffect(() => {
    const s = Math.sign(end - start) * step;

    const id = window.setInterval(() => {
      v.current += s;

      if (start > end && v.current <= end) {
        window.clearInterval(id);
      } else if (start < end && v.current >= end) {
        window.clearInterval(id);
      }

      setValue(v.current);
    }, interval);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  return render(value);
};

Countdown.defaultProps = {
  render: (value: any) => null,
};

const ModalExample = () => {
  const [show, showModal] = React.useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          showModal(!show);
        }}
      >
        show modal
      </Button>
      <Modal onClose={() => showModal(false)} open={show}>
        <Modal.Header>1</Modal.Header>
        <Modal.Body>
          <div style={{ height: 2000 }} />
        </Modal.Body>
        <Modal.Footer>3</Modal.Footer>
      </Modal>
    </div>
  );
};

render(
  <Page>
    <ModalExample />
    <Example>
      <Countdown
        start={0}
        end={10}
        render={value => (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <CircleProgress percentage={(value / 10) * 100} />
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                textAlign: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 'bold',
              }}
            >
              {value}
            </div>
          </div>
        )}
      />
      <Countdown
        render={value => (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <CircleProgress reverse percentage={((10 - value) / 10) * 100} />
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                textAlign: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 'bold',
              }}
            >
              {value}
            </div>
          </div>
        )}
      />
    </Example>

    <NewPlayer />

    <Example name="Button">
      <CircleProgress />
    </Example>

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
