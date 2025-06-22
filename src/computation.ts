import { Coord, earthRadius, featureCollection } from '@turf/helpers';
import { Geodesic } from 'geographiclib-geodesic';
import type { FeatureCollection, Point } from 'geojson';
import { GameConfig, GameMode, Geoid } from './game-modes';
import geodesicIntercept from './geodesic-intercept';
import { distance } from './util';

const SPHERICAL_EARTH = new Geodesic.Geodesic(earthRadius, 0);

export interface DistanceProps {
  distance: number;
  dest: Point;
}

const FARAWAY_DISTANCE: DistanceProps = {
  distance: Infinity,
  dest: { type: 'Point', coordinates: [0, 0] },
};

const distanceCalc = (game: GameConfig): ((p: Coord) => DistanceProps) => {
  switch (game.mode) {
    case GameMode.BASIC:
      return (p) => ({
        distance: distance(p, game.target, game.geoid),
        dest: game.target.geometry,
      });
    case GameMode.LINE:
      return (p) => {
        const result = geodesicIntercept(
          game.target.geometry,
          p,
          game.constrainToSegment,
          game.geoid === Geoid.SPHERE ? SPHERICAL_EARTH : undefined
        );
        return {
          distance: result.properties.s12 / 1000,
          dest: result.geometry,
        };
      };

    default:
      return (p) =>
        game.target.features.reduce<DistanceProps>((best, f) => {
          const thisDist = distance(p, f, game.geoid);
          return thisDist < best.distance
            ? { distance: thisDist, dest: f.geometry }
            : best;
        }, FARAWAY_DISTANCE);
  }
};

export const decorate = <P extends {}>(
  game: GameConfig,
  photos: FeatureCollection<Point, P>
): FeatureCollection<Point, P & DistanceProps> => {
  const calculator = distanceCalc(game);
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
