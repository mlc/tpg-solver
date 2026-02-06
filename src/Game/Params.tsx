import { FunctionComponent } from 'preact';
import MaybeError from '../MaybeError';
import { GameMode } from '../game-modes';
import { useAppSelector } from '../store';
import BasicInput from './BasicInput';
import LineInput from './LineInput';
import MidpointInput from './MidpointInput';
import MultiInput from './MultiInput';

const GameInput: FunctionComponent = () => {
  const mode = useAppSelector((state) => state.game.mode);

  switch (mode) {
    case GameMode.BASIC:
      return <BasicInput />;
    case GameMode.LINE:
      return <LineInput />;
    case GameMode.MULTI:
      return <MultiInput />;
    case GameMode.MIDPOINT:
      return <MidpointInput />;
  }
};

const GameError: FunctionComponent = () => {
  const error = useAppSelector((state) => state.game.error);
  return <MaybeError error={error} />;
};

const GameParams: FunctionComponent = () => (
  <div id="game-params">
    <GameInput />
    <GameError />
  </div>
);

export default GameParams;
