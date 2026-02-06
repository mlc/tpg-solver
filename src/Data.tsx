import type { FunctionComponent } from 'preact';
import { useCallback } from 'preact/compat';
import type { FeatureCollection, Point } from 'geojson';
import FileInput from './FileInput';
import MaybeError from './MaybeError';
import { setError, setPhotos, setSecondPhotos } from './dataSlice';
import { parseData } from './parseData';
import { useAppDispatch, useAppSelector } from './store';
import { stringifyError } from './util';

const Data: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.game.mode);
  const count = useAppSelector((state) => state.data.photos.features.length);
  const secondCount = useAppSelector(
    (state) => state.data.secondPhotos?.features?.length
  );
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

  const onSecondFile = useCallback(
    (file: File) => {
      parseData(file).then(
        (data) =>
          dispatch(
            setSecondPhotos(
              data as FeatureCollection<Point, Record<string, string>>
            )
          ),
        (err) => dispatch(setError(stringifyError(err)))
      );
    },
    [dispatch]
  );

  const clearSecondFile = useCallback(
    () => dispatch(setSecondPhotos(null)),
    [dispatch]
  );

  return (
    <form>
      <h2>Photos Data</h2>
      <p>Currently loaded {count} photos.</p>
      <FileInput onFile={onFile} kind={['csv', 'json']}>
        Load File
      </FileInput>
      {mode === 'midpoint' && (
        <>
          <p>
            Second set of photos:{' '}
            {typeof secondCount === 'number'
              ? `Loaded a separate set of ${secondCount} photos.`
              : 'Using main data.'}
          </p>
          <FileInput onFile={onSecondFile} kind={['csv', 'json']}>
            Load File
          </FileInput>
          {typeof secondCount !== 'number' ? null : (
            <p>
              <button onClick={clearSecondFile} type="button">
                Use main data
              </button>
            </p>
          )}
        </>
      )}
      <MaybeError error={error} />
      <p class="hint">
        Supported files:{' '}
        <a href="https://en.wikipedia.org/wiki/Comma-separated_values">CSV</a>{' '}
        with latitude and longitude columns, or{' '}
        <a href="https://geojson.org/">GeoJSON</a> Point FeatureCollection
      </p>
    </form>
  );
};

export default Data;
