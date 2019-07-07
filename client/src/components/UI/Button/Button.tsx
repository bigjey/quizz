import './Button.css';

import React, { ReactNode } from 'react';
import c from 'classnames';

interface ButtonProps {
  children: ReactNode;
  className: string;
  full?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  full,
  ...rest
}) => {
  const classes = c('Button', { 'Button--full': full }, className);

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

Button.defaultProps = {
  full: false,
};
