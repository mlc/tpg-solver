import * as React from 'react';

interface Props {
  accept?: string;
  onFile?: (file: File) => void;
  children?: React.ReactNode;
}

const FileInput: React.FC<Props> = ({ accept, onFile, children }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onLoadClick = React.useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

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
