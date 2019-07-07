import './Button.scss';

import React, { ReactNode } from 'react';
import c from 'classnames';

interface ButtonProps {
  full?: boolean;
  type?: 'submit' | 'reset' | 'button';
  variant?: 'normal' | 'big' | 'small';
}

export const Button: React.FC<
  ButtonProps & React.HTMLProps<HTMLButtonElement>
> = ({ children, className = '', full, variant, ...rest }) => {
  const classes = c(
    'Button',
    `Button--size-${variant}`,
    { 'Button--full': full },
    className
  );

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
};

Button.defaultProps = {
  full: false,
  type: 'button',
  variant: 'normal',
};
