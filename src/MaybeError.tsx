import { FunctionComponent } from 'preact';

interface Props {
  error: string | null | undefined;
}

const MaybeError: FunctionComponent<Props> = ({ error }) => {
  if (error) {
    return <p class="error">{error}</p>;
  } else {
    return null;
  }
};

export default MaybeError;
