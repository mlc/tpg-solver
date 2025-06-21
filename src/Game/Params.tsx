import * as React from 'react';
import MaybeError from '../MaybeError';
import { GameMode } from '../game-modes';
import { useAppSelector } from '../store';
import BasicInput from './BasicInput';
import LineInput from './LineInput';
import MultiInput from './MultiInput';

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
