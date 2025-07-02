import type { Feature, LineString } from 'geojson';
import { GameConfig, GameMode } from './game-modes';
import { gcFmt, gcFmtFeature } from './gcmap';
import { createAppSelector } from './store';
import { extendLine } from './util';

const isDegenerate = (line: Feature<LineString>) =>
  line.geometry.coordinates.length < 2 ||
  line.geometry.coordinates[0].join(',') ===
    line.geometry.coordinates[1].join(',');

export const selectGameConfig = createAppSelector(
  [
    (state) => state.game.mode,
    (state) => state.game.lineTarget,
    (state) => state.game.lineWraparound,
    (state) => state.game.basicTarget,
    (state) => state.game.multiTarget,
    (state) => state.game.geoid,
    (state) => state.game.error,
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
        constrainToSegment:
          !lineWraparound || lineTarget.geometry.coordinates.length > 2,
      };
    } else if (mode === GameMode.MULTI && multiTarget.features.length > 0) {
      return { mode, target: multiTarget, geoid };
    } else {
      return null;
    }
  }
);

export const selectExtraGc = createAppSelector(
  selectGameConfig,
  (game): string[] => {
    if (game?.mode === GameMode.LINE) {
      if (game.constrainToSegment) {
        return [gcFmtFeature(game.target)];
      } else {
        return [
          ...game.target.geometry.coordinates.map(gcFmt),
          'm:-',
          gcFmtFeature(extendLine(game.target)),
        ];
      }
    } else if (game?.mode === GameMode.MULTI) {
      return game.target.features.map(gcFmtFeature);
    } else {
      return [];
    }
  }
);
