import * as React from 'react';

interface Props {
  error: string | null | undefined;
}

const MaybeError: React.FC<Props> = ({ error }) => {
  if (error) {
    return <p className="error">{error}</p>;
  } else {
    return null;
  }
};

export default MaybeError;
