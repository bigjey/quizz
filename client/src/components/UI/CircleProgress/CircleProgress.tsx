import './CircleProgress.scss';

import React from 'react';

const CircleProgress = ({
  radius = 100,
  thickness = 15,
  percentage = 20,
  reverse = false,
  animationSpeed = 100,
}) => {
  const stroke = radius - (radius - thickness);
  const r = radius - thickness + stroke / 2;
  const length = Math.PI * 2 * r;
  let filled = (length * percentage) / 100;
  let offset = 0;

  if (reverse) {
    filled = length - filled;
    offset = -(length - filled);
  }

  return (
    <>
      <svg className="CircleProgress" width={radius * 2} height={radius * 2}>
        <circle
          className="CircleProgress--circle"
          cx={radius}
          cy={radius}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${length}`}
          strokeDashoffset={offset}
          stroke="#000"
          style={{
            transition: `${animationSpeed}ms linear`,
          }}
        />
      </svg>
    </>
  );
};

export { CircleProgress };
