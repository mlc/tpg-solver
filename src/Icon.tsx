import { FunctionComponent } from 'preact';

interface Props {
  name: string;
  label: string;
  onClick?: () => void;
}

const Icon: FunctionComponent<Props> = ({ name, label, onClick }) => (
  <span
    className="icon"
    role={onClick ? 'button' : 'img'}
    aria-label={label}
    onClick={onClick}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <use xlinkHref={`#${name}`} />
    </svg>
  </span>
);

export default Icon;
