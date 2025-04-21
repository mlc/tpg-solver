import * as React from 'react';
import { GameConfig, GameMode } from './game-modes';
import { point } from '@turf/helpers';

export const DEFAULT_GAME: GameConfig = {
  mode: GameMode.BASIC,
  target: point([0, 0]),
};

const context = React.createContext<GameConfig>(DEFAULT_GAME);

export const GameProvider = context.Provider;
export const useGame = () => React.useContext(context);
