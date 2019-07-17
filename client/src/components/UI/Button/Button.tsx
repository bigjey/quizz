import './Button.scss';

import React from 'react';

import c from 'classnames';

interface ButtonProps {
  full?: boolean;
  type?: 'submit' | 'reset' | 'button';
  variant?: 'normal' | 'big' | 'small';
  color?: 'default' | 'green' | 'blue';
}

interface ButtonStaticProps {
  Group: React.FC<React.HTMLProps<HTMLDivElement>>;
}

const Button: React.FC<ButtonProps & React.HTMLProps<HTMLButtonElement>> &
  ButtonStaticProps = ({
  children,
  className = '',
  full,
  variant,
  color,
  ...rest
}) => {
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

Button.Group = ({ children, className, ...rest }) => {
  const classes = c('ButtonGroup', className);

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export { Button };
