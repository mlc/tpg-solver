import { createSelector } from '@reduxjs/toolkit';
import type { Feature, LineString } from 'geojson';
import { GameConfig, GameMode } from './game-modes';
import { RootState, useAppSelector } from './store';

const isDegenerate = (line: Feature<LineString>) =>
  line.geometry.coordinates.length < 2 ||
  line.geometry.coordinates[0].join(',') ===
    line.geometry.coordinates[1].join(',');

const selectGameConfig = createSelector(
  [
    (state: RootState) => state.game.mode,
    (state: RootState) => state.game.lineTarget,
    (state: RootState) => state.game.lineWraparound,
    (state: RootState) => state.game.basicTarget,
    (state: RootState) => state.game.multiTarget,
    (state: RootState) => state.game.geoid,
    (state: RootState) => state.game.error,
  ],
  (
    mode,
    lineTarget,
    lineWraparound,
    basicTarget,
    multiTarget,
    geoid,
    error
  ): GameConfig | null => {
    if (error) {
      return null;
    } else if (mode === GameMode.BASIC) {
      return { mode, target: basicTarget, geoid };
    } else if (mode === GameMode.LINE && !isDegenerate(lineTarget)) {
      return {
        mode,
        target: lineTarget,
        geoid,
        constrainToSegment: !lineWraparound,
      };
    } else if (mode === GameMode.MULTI && multiTarget.features.length > 0) {
      return { mode, target: multiTarget, geoid };
    } else {
      return null;
    }
  }
);

export const useGameConfig = (): GameConfig | null =>
  useAppSelector(selectGameConfig);
