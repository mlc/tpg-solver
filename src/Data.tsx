import type { FunctionComponent } from 'preact';
import { useCallback } from 'preact/compat';
import type { FeatureCollection, Point } from 'geojson';
import FileInput from './FileInput';
import MaybeError from './MaybeError';
import { setError, setPhotos } from './dataSlice';
import { parseData } from './parseData';
import { useAppDispatch, useAppSelector } from './store';
import { stringifyError } from './util';

const Data: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.data.photos.features.length);
  const error = useAppSelector((state) => state.data.error);

  const onFile = useCallback(
    (file: File) => {
      parseData(file).then(
        (data) =>
          dispatch(
            setPhotos(data as FeatureCollection<Point, Record<string, string>>)
          ),
        (err) => dispatch(setError(stringifyError(err)))
      );
    },
    [dispatch]
  );

  return (
    <form>
      <h2>Photos Data</h2>
      <p>Currently loaded {count} photos.</p>
      <FileInput onFile={onFile} kind={['csv', 'json']}>
        Load File
      </FileInput>
      <MaybeError error={error} />
      <p className="hint">
        Supported files:{' '}
        <a href="https://en.wikipedia.org/wiki/Comma-separated_values">CSV</a>{' '}
        with latitude and longitude columns, or{' '}
        <a href="https://geojson.org/">GeoJSON</a> Point FeatureCollection
      </p>
    </form>
  );
};

export default Data;
