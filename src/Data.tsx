import * as React from 'react';
import type { FeatureCollection, Point } from 'geojson';
import MaybeError from './MaybeError';
import { setError, setPhotos } from './dataSlice';
import parseData from './parseData';
import { useAppDispatch, useAppSelector } from './store';
import { stringifyError } from './util';

const Data: React.FC = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.data.photos.features.length);
  const error = useAppSelector((state) => state.data.error);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onLoadClick = React.useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => {
        const files = evt.target.files;
        if (files?.length === 1) {
          parseData(files[0]).then(
            (data) =>
              dispatch(
                setPhotos(
                  data as FeatureCollection<Point, Record<string, string>>
                )
              ),
            (err) => dispatch(setError(stringifyError(err)))
          );
        }
      },
      [dispatch]
    );

  return (
    <form>
      <h2>Photos Data</h2>
      <p>Currently loaded {count} photos.</p>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        id="file"
        accept="text/csv,application/json,application/geo+json,.csv,.json,.geojson"
        onChange={onFileChange}
      />
      <p>
        <button onClick={onLoadClick} type="button">
          Load File
        </button>
      </p>
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
