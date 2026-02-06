// ref https://github.com/Turfjs/turf/blob/master/packages/turf-nearest-point-on-line/index.ts
// but use our geodesic-intercept.ts instead of their buggy code for the
// nearestPointOnSegment bit
import { type Coord, lineString, point } from '@turf/helpers';
import { getCoords } from '@turf/invariant';
import { flattenEach } from '@turf/meta';
import { Geodesic } from 'geographiclib-geodesic';
import type {
  Feature,
  LineString,
  MultiLineString,
  Point,
  Position,
} from 'geojson';
import { Geoid } from './game-modes';
import geodesicIntercept, { NearestPointProps } from './geodesic-intercept';
import { SPHERICAL_EARTH } from './util';

type NearestPointFeature = Feature<Point, NearestPointProps>;

const nearestPointOnLine = <G extends LineString | MultiLineString>(
  lines: G | Feature<G>,
  pt: Coord,
  constrainToSegment = true,
  geoid = Geoid.WGS84
): NearestPointFeature => {
  if (!lines || !pt) {
    throw new Error('missing required arguments');
  }

  let closestPt: NearestPointFeature = point([Infinity, Infinity], {
    s12: Infinity,
    azi1: Infinity,
  });

  flattenEach(lines, (line) => {
    const coords: Position[] = getCoords(line);
    const ellipse = geoid === Geoid.SPHERE ? SPHERICAL_EARTH : Geodesic.WGS84;

    for (let i = 0; i < coords.length - 1; i++) {
      const intersectPt = geodesicIntercept(
        lineString([coords[i], coords[i + 1]]),
        pt,
        constrainToSegment,
        ellipse
      );
      if (
        intersectPt &&
        intersectPt.properties.s12 < closestPt.properties.s12
      ) {
        closestPt = intersectPt;
      }
    }
  });

  return closestPt;
};

export default nearestPointOnLine;
