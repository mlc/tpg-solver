import { Coord, featureCollection } from '@turf/helpers';
import type { FeatureCollection, Point } from 'geojson';
import { GameConfig, GameMode } from './game-modes';
import nearestPointOnLine from './nearest-point-on-line';
import { distance } from './util';

export interface DistanceProps {
  distance: number;
  dest: Point;
}

const FARAWAY_DISTANCE: DistanceProps = {
  distance: Infinity,
  dest: { type: 'Point', coordinates: [0, 0] },
};

const distanceCalc = (
  game: GameConfig
): ((p: Coord) => DistanceProps) | null => {
  switch (game.mode) {
    case GameMode.BASIC:
      return (p) => ({
        distance: distance(p, game.target, game.geoid),
        dest: game.target.geometry,
      });
    case GameMode.LINE:
      return (p) => {
        const result = nearestPointOnLine(
          game.target.geometry,
          p,
          game.constrainToSegment,
          game.geoid
        );
        return {
          distance: result.properties.s12 / 1000,
          dest: result.geometry,
        };
      };
    case GameMode.MULTI:
      return (p) =>
        game.target.features.reduce<DistanceProps>((best, f) => {
          const thisDist = distance(p, f, game.geoid);
          return thisDist < best.distance
            ? { distance: thisDist, dest: f.geometry }
            : best;
        }, FARAWAY_DISTANCE);
    default:
      return null;
  }
};

export const decorate = <P extends {}>(
  game: GameConfig,
  photos: FeatureCollection<Point, P>
): FeatureCollection<Point, P & DistanceProps> => {
  const calculator = distanceCalc(game);
  if (!calculator) {
    return featureCollection([]);
  }
  try {
    return featureCollection(
      photos.features
        .map((photo, i) => ({
          ...photo,
          properties: { ...photo.properties, ...calculator(photo) },
          id: i,
        }))
        .sort((a, b) => a.properties.distance - b.properties.distance)
    );
  } catch (error) {
    console.error(error);
    return featureCollection([]);
  }
};
