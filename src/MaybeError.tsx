import { FunctionComponent } from 'preact';

interface Props {
  error: string | null | undefined;
}

const MaybeError: FunctionComponent<Props> = ({ error }) => {
  if (error) {
    return <p className="error">{error}</p>;
  } else {
    return null;
  }
};

export default MaybeError;
