import * as React from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setBasic, setLine0, setLine1, setMulti } from './gameSlice';
import { GameMode } from './game-modes';
import MaybeError from './MaybeError';

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
