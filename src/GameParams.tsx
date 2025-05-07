import * as React from 'react';
import FileInput from './FileInput';
import MaybeError from './MaybeError';
import { GameMode, Geoid } from './game-modes';
import {
  setBasic,
  setLine0,
  setLine1,
  setLineWraparound,
  setMulti,
  setUploadError,
  setUploadLine,
} from './gameSlice';
import { parseLineString } from './parseData';
import { useAppDispatch, useAppSelector } from './store';
import { stringifyError } from './util';

const BasicInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.basicText);
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => dispatch(setBasic(evt.target.value)),
      [dispatch]
    );

  return (
    <label>
      Target coordinates:
      <input name="basic" onChange={onChange} value={text} />
    </label>
  );
};

const MultiInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.multiText);
  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> =
    React.useCallback(
      (evt) => {
        dispatch(setMulti(evt.target.value));
      },
      [dispatch]
    );
  return (
    <label>
      Target coordinates (one per line):
      <br />
      <textarea name="multi" value={text} onChange={onChange} />
    </label>
  );
};

const LineInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.lineText);
  const canWraparound = useAppSelector(
    (state) =>
      state.game.lineTarget.geometry.coordinates.length === 2 &&
      state.game.geoid === Geoid.WGS84
  );
  const wraparound = useAppSelector((state) => state.game.lineWraparound);
  const onChange0: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => dispatch(setLine0(evt.target.value)),
      [dispatch]
    );
  const onChange1: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => dispatch(setLine1(evt.target.value)),
      [dispatch]
    );
  const onChangeWraparound: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => dispatch(setLineWraparound(evt.target.checked)),
      [dispatch]
    );
  const onFile = React.useCallback(
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

const GameInput: React.FC = () => {
  const mode = useAppSelector((state) => state.game.mode);

  switch (mode) {
    case GameMode.BASIC:
      return <BasicInput />;
    case GameMode.LINE:
      return <LineInput />;
    case GameMode.MULTI:
      return <MultiInput />;
  }
};

const GameError: React.FC = () => {
  const error = useAppSelector((state) => state.game.error);
  return <MaybeError error={error} />;
};

const GameParams: React.FC = () => (
  <div id="game-params">
    <GameInput />
    <GameError />
  </div>
);

export default GameParams;
