import * as React from 'react';
import { useAppDispatch, useAppSelector } from './store';
import parseData from './parseData';
import { setError, setPhotos } from './dataSlice';
import { stringifyError } from './util';
import MaybeError from './MaybeError';
import type { FeatureCollection, Point } from 'geojson';

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
        Supported files: CSV with latitude and longitude parameters, or GeoJSON
        Point FeatureCollection
      </p>
    </form>
  );
};

export default Data;
