import { ChangeEventHandler, useCallback } from 'preact/compat';
import FileInput from '../FileInput';
import {
  setLine0,
  setLine1,
  setLineWraparound,
  setUploadError,
  setUploadLine,
} from '../gameSlice';
import { parseLineString } from '../parseData';
import { useAppDispatch, useAppSelector } from '../store';
import { stringifyError } from '../util';

const LineInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.lineText);
  const canWraparound = useAppSelector(
    (state) => state.game.lineTarget.geometry.coordinates.length === 2
  );
  const wraparound = useAppSelector((state) => state.game.lineWraparound);
  const onChange0: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => dispatch(setLine0(evt.currentTarget.value)),
    [dispatch]
  );
  const onChange1: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => dispatch(setLine1(evt.currentTarget.value)),
    [dispatch]
  );
  const onChangeWraparound: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => dispatch(setLineWraparound(evt.currentTarget.checked)),
    [dispatch]
  );
  const onFile = useCallback(
    async (file: File) => {
      try {
        const line = await parseLineString(file);
        dispatch(setUploadLine(line));
      } catch (e) {
        dispatch(setUploadError(stringifyError(e)));
      }
    },
    [dispatch]
  );

  return (
    <>
      <label>
        Point 1:
        <input name="line0" onChange={onChange0} value={text[0]} />
      </label>
      <br />
      <label>
        Point 2:
        <input name="line1" onChange={onChange1} value={text[1]} />
      </label>
      {canWraparound && (
        <>
          <br />
          <label>
            <input
              name="wraparound"
              onChange={onChangeWraparound}
              checked={wraparound}
              type="checkbox"
            />
            Wrap around the entire globe
          </label>
        </>
      )}
      <FileInput onFile={onFile} kind={['kml', 'json']}>
        Upload KML or GeoJSON
      </FileInput>
    </>
  );
};

export default LineInput;
