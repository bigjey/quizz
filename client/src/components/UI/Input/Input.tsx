import './Input.css';

import React from 'react';
import c from 'classnames';

interface InputProps {
  className: string;
}

export const Input: React.FC<InputProps> = ({ className, ...rest }) => {
  const classes = c('Input', className);

  return <input className={classes} {...rest} />;
};

Input.defaultProps = {
  className: '',
};
