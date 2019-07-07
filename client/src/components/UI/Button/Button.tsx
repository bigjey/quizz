import './Button.scss';

import React, { ReactNode } from 'react';
import c from 'classnames';

interface ButtonProps {
  full?: boolean;
  type?: 'submit' | 'reset' | 'button';
  variant?: 'normal' | 'big' | 'small';
  color?: 'default' | 'green' | 'blue';
}

export const Button: React.FC<
  ButtonProps & React.HTMLProps<HTMLButtonElement>
> = ({ children, className = '', full, variant, color, ...rest }) => {
  const classes = c(
    'Button',
    `Button--size-${variant}`,
    `Button--color-${color}`,
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
  color: 'default',
};
