import * as React from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { useCallback } from 'react';
import parseData from './parseData';
import { setError, setPhotos } from './dataSlice';
import { stringifyError } from './util';
import MaybeError from './MaybeError';

const Data: React.FC = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.data.photos.features.length);
  const error = useAppSelector((state) => state.data.error);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onLoadClick = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      const files = evt.target.files;
      if (files?.length === 1) {
        parseData(files[0]).then(
          (data) => dispatch(setPhotos(data)),
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
    </form>
  );
};

export default Data;
