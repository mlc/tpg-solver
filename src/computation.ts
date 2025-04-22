import { Coord, featureCollection } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { GameConfig, GameMode } from './game-modes';
import { useAppSelector } from './store';
import { distance } from './util';

const isDegenerate = (line: Feature<LineString>) =>
  line.geometry.coordinates.length !== 2 ||
  line.geometry.coordinates[0].join(',') ===
    line.geometry.coordinates[1].join(',');

export const useGameConfig = (): GameConfig | null => {
  const { mode, lineTarget, basicTarget, multiTarget, error } = useAppSelector(
    ({ game }) => game
  );
  if (error) {
    return null;
  } else if (mode === GameMode.BASIC) {
    return { mode, target: basicTarget };
  } else if (mode === GameMode.LINE && !isDegenerate(lineTarget)) {
    return { mode, target: lineTarget };
  } else if (mode === GameMode.MULTI && multiTarget.features.length > 0) {
    return { mode, target: multiTarget };
  } else {
    return null;
  }
};

const distanceCalc = (game: GameConfig): ((p: Coord) => number) => {
  switch (game.mode) {
    case GameMode.BASIC:
      return (p) => distance(p, game.target);
    case GameMode.LINE:
      return (p) => nearestPointOnLine(game.target, p).properties.dist;
    default:
      return (p) =>
        Math.min(...game.target.features.map((f) => distance(p, f)));
  }
};

export const decorate = <P extends {}>(
  game: GameConfig,
  photos: FeatureCollection<Point, P>
): FeatureCollection<Point, P & { distance: number }> => {
  const calculator = distanceCalc(game);
  try {
    return featureCollection(
      photos.features
        .map((photo) => ({
          ...photo,
          properties: { ...photo.properties, distance: calculator(photo) },
        }))
        .sort((a, b) => a.properties.distance - b.properties.distance)
    );
  } catch (error) {
    console.error(error);
    return featureCollection([]);
  }
};
