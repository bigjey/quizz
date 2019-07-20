import React from 'react';
import { render } from 'react-dom';

import { Page } from './components/Page';
import { NewPlayer } from './components/NewPlayer';
import { Button, Modal, Countdown } from './components/UI';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { CircleProgress } from './components/UI/CircleProgress';

const Example = ({ name = null, children }) => (
  <div style={{ margin: '10px 0' }}>
    {name !== null && <div style={{ marginBottom: 5 }}>{name}</div>}
    {children}
  </div>
);

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
        {({ closeModal }) => (
          <>
            <Modal.Header
              style={{
                fontSize: 24,
              }}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique
              tempore assumenda mollitia reprehenderit sit, incidunt id quos
              aperiam expedita, in iste accusamus vel quibusdam ullam, aut
              dolore est culpa inventore?
            </Modal.Header>
            <Modal.Body>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum
                eius dolor laboriosam voluptates commodi iusto quis, delectus
                possimus eligendi! Fugiat, accusantium. Possimus natus,
                veritatis dolore quibusdam at nihil aspernatur illo.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group>
                <div style={{ display: 'flex', width: '100%' }}>
                  <Button
                    onClick={() => {
                      closeModal();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="green"
                    onClick={() => {
                      closeModal();
                    }}
                    style={{
                      flexGrow: 1,
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Create
                  </Button>
                </div>
              </Button.Group>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

render(
  <Page>
    <ModalExample />
    <Example>
      <Countdown
        start={5}
        end={0}
        render={v => (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <>
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
                  fontSize: 24,
                }}
              >
                {v}
              </div>
              <CircleProgress
                radius={50}
                reverse
                thickness={4}
                percentage={100 - v * 20}
              />
            </>
          </div>
        )}
      />
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
