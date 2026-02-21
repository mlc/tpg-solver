import type { CSSProperties, FunctionComponent } from 'preact';

interface Props {
  name: string;
  label: string;
  style?: CSSProperties;
  svgStyle?: CSSProperties;
  onClick?: () => void;
}

const Icon: FunctionComponent<Props> = ({ name, label, onClick, style }) => (
  <span
    class="icon"
    role={onClick ? 'button' : 'img'}
    aria-label={label}
    onClick={onClick}
    style={style}
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
