import React, { ReactElement } from 'react';

interface ButtonProps {
  start?: number;
  end?: number;
  step?: number;
  interval?: number;
  render(value: number): ReactElement;
}

const Countdown: React.FC<ButtonProps> = ({
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
  start: 10,
  end: 0,
  step: 1,
  interval: 1000,
  render: (v: number) => null,
};

export { Countdown };
