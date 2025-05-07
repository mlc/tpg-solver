import { Coord, featureCollection } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { GameConfig, GameMode, Geoid } from './game-modes';
import geodesicIntercept from './geodesic-intercept';
import { useAppSelector } from './store';
import { distance } from './util';

const isDegenerate = (line: Feature<LineString>) =>
  line.geometry.coordinates.length < 2 ||
  line.geometry.coordinates[0].join(',') ===
    line.geometry.coordinates[1].join(',');

export const useGameConfig = (): GameConfig | null => {
  const {
    mode,
    lineTarget,
    lineWraparound,
    basicTarget,
    multiTarget,
    geoid,
    error,
  } = useAppSelector(({ game }) => game);
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
};

export interface DistanceProps {
  distance: number;
  dest: Point;
}

const FARAWAY_DISTANCE: DistanceProps = {
  distance: Infinity,
  dest: { type: 'Point', coordinates: [0, 0] },
};

const distanceCalc = (game: GameConfig): ((p: Coord) => DistanceProps) => {
  console.log(game);
  switch (game.mode) {
    case GameMode.BASIC:
      return (p) => ({
        distance: distance(p, game.target, game.geoid),
        dest: game.target.geometry,
      });
    case GameMode.LINE:
      if (game.geoid === Geoid.WGS84) {
        return (p) => {
          const result = geodesicIntercept(
            game.target.geometry,
            p,
            game.constrainToSegment
          );
          return {
            distance: result.properties.s12 / 1000,
            dest: result.geometry,
          };
        };
      } else {
        return (p) => {
          const result = nearestPointOnLine(game.target, p);
          return {
            distance: result.properties.dist,
            dest: result.geometry,
          };
        };
      }
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
