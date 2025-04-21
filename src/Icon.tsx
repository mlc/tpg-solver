import * as React from 'react';

interface Props {
  name: string;
  label: string;
  onClick?: () => void;
}

const Icon: React.FC<Props> = ({ name, label, onClick }) => (
  <span className="icon" role="button" aria-label={label} onClick={onClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <use xlinkHref={`#${name}`} />
    </svg>
  </span>
);

export default Icon;
