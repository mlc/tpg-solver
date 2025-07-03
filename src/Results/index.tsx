import React, { useMemo } from 'react';
import { decorate } from '../computation';
import { selectExtraGc, selectGameConfig } from '../gameConfig';
import { useAppSelector } from '../store';
import Grid from './Grid';

const Results: React.FC = () => {
  const game = useAppSelector(selectGameConfig);
  const extraGc = useAppSelector(selectExtraGc);
  const photos = useAppSelector((state) => state.data.photos);
  const results = useMemo(() => {
    if (game && photos && photos.features.length > 0) {
      return decorate(game, photos);
    } else {
      return null;
    }
  }, [game, photos]);
  if (results && results.features.length > 0) {
    return (
      <>
        <h2>Results</h2>
        <Grid results={results} extraGc={extraGc} />
      </>
    );
  } else {
    return null;
  }
};

export default Results;
