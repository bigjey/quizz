import './Modal.scss';

import React, { ReactElement } from 'react';
import c from 'classnames';
import { createPortal } from 'react-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { Button } from '..';

interface ModalProps {
  className?: string;
  open?: boolean;
  onClose?(): void;
  children?(v: ModalRenderer): ReactElement;
}

interface ModalRenderer {
  closeModal?(): void;
}

interface ModalCompoundState {
  closeModal?(): void;
}

interface ModalStaticProps {
  Header: React.FC<React.HTMLProps<HTMLDivElement> & ModalCompoundState>;
  Body: React.FC<React.HTMLProps<HTMLDivElement>>;
  Footer: React.FC<React.HTMLProps<HTMLDivElement>>;
}

const Modal: React.FC<ModalProps> & ModalStaticProps = ({
  className = '',
  open,
  children,
  onClose,
  ...rest
}) => {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  const closeModal = (): void => {
    onClose();
    setIsOpen(false);
  };

  const classes = c('Modal', className, {
    'Modal--open': isOpen,
  });

  if (!isOpen) {
    return null;
  }

  const renderer: ModalRenderer = {
    closeModal,
  };

  const ch = children(renderer);

  const newChildren = React.Children.map(
    ch.type === React.Fragment ? ch.props.children : ch,
    (el: ReactElement) => {
      if (
        el.type !== Modal.Header &&
        el.type !== Modal.Body &&
        el.type !== Modal.Footer
      ) {
        throw new Error(
          'Modal direct children should be only `Modal.Header` or `Modal.Body` or `Modal.Footer`'
        );
      }
      return React.cloneElement(el, {
        closeModal,
      });
    }
  );

  return createPortal(
    <div className={classes}>
      <div className="Modal--back" onClick={closeModal} />
      <div className="Modal--content" {...rest}>
        {newChildren}
      </div>
    </div>,
    document.body
  );
};

Modal.Header = ({ closeModal, children, ...rest }) => {
  return (
    <div className="Modal--Header" {...rest}>
      <div className="Modal--Header-content">{children}</div>
      <div className="Modal--Header-close">
        <Button onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>
    </div>
  );
};

Modal.Body = ({ children }) => <div className="Modal--Body">{children}</div>;

Modal.Footer = ({ children }) => (
  <div className="Modal--Footer">{children}</div>
);

Modal.defaultProps = {
  open: false,
  onClose: () => {},
};

export { Modal };
