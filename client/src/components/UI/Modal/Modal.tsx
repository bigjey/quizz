import './Modal.scss';

import React from 'react';
import c from 'classnames';
import { createPortal } from 'react-dom';

interface ModalProps {
  className?: string;
  open?: boolean;
  onClose?: Function;
}

interface ModalStaticProps {
  Header: React.FC;
  Body: React.FC;
  Footer: React.FC;
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

  const closeModal = () => {
    onClose();
    setIsOpen(false);
  };

  const classes = c('Modal', className, {
    'Modal--open': isOpen,
  });

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className={classes}>
      <div className="Modal--back" onClick={closeModal} />
      <div className="Modal--content" {...rest}>
        {children}
      </div>
    </div>,
    document.body
  );
};

Modal.Header = ({ children }) => (
  <div className="Modal--Header">{children}</div>
);

Modal.Body = ({ children }) => <div className="Modal--Body">{children}</div>;

Modal.Footer = ({ children }) => (
  <div className="Modal--Footer">{children}</div>
);

Modal.defaultProps = {
  open: false,
  onClose: () => {},
};

export { Modal };
