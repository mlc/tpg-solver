import React, { useCallback, useRef } from 'react';

type Kind = 'csv' | 'kml' | 'json';

interface Props {
  kind: Kind[];
  onFile?: (file: File) => void;
  children?: React.ReactNode;
}

const mimes: Record<Kind, string> = {
  csv: 'text/csv',
  json: 'application/json,application/geo+json',
  kml: 'application/vnd.google-earth.kml+xml',
};

const exts: Record<Kind, string> = {
  csv: '.csv',
  json: '.json,.geojson',
  kml: '.kml',
};

const FileInput: React.FC<Props> = ({ kind, onFile, children }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => {
        const files = evt.target.files;
        if (files?.length === 1 && onFile) {
          onFile(files[0]);
        }
      },
      [onFile]
    );

  const accept = [mimes, exts]
    .flatMap((map) => kind.map((k) => map[k]))
    .join(',');

  return (
    <p>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept={accept}
        onChange={onFileChange}
      />

      <button onClick={onLoadClick} type="button">
        {children}
      </button>
    </p>
  );
};

export default FileInput;
