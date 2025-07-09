import { FunctionComponent } from 'preact';
import { decorate } from '../computation';
import { selectExtraGc, selectGameConfig } from '../gameConfig';
import { createAppSelector, useAppSelector } from '../store';
import Grid from './Grid';

const selectResults = createAppSelector(
  [selectGameConfig, (state) => state.data.photos],
  (game, photos) => {
    if (game && photos && photos.features.length > 0) {
      return decorate(game, photos);
    } else {
      return null;
    }
  }
);

const Results: FunctionComponent = () => {
  const extraGc = useAppSelector(selectExtraGc);
  const results = useAppSelector(selectResults);
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
