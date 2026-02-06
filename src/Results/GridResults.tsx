import { FunctionComponent } from 'preact';
import { decorate } from '../computation';
import { selectExtraGc, selectGameConfig } from '../gameConfig';
import { createAppSelector, useAppSelector } from '../store';
import Grid from './Grid';
import MapLink from './MapLink';

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

const GridResults: FunctionComponent = () => {
  const extraGc = useAppSelector(selectExtraGc);
  const results = useAppSelector(selectResults);
  if (results && results.features.length > 0) {
    return (
      <>
        <h2>
          Results <MapLink results={results} />
        </h2>
        <Grid results={results} extraGc={extraGc} />
      </>
    );
  } else {
    return null;
  }
};

export default GridResults;
