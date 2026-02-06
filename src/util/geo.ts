import turfDist from '@turf/distance';
import { type Coord, earthRadius, lineString } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import { Geodesic } from 'geographiclib-geodesic';
import type { Feature, LineString, Position } from 'geojson';
import { Geoid } from '../game-modes';

export const SPHERICAL_EARTH = new Geodesic.Geodesic(earthRadius, 0);

const wgs84Dist = (a: Coord, b: Coord) => {
  const [lon1, lat1] = getCoord(a);
  const [lon2, lat2] = getCoord(b);
  const { s12 } = Geodesic.WGS84.Inverse(
    lat1,
    lon1,
    lat2,
    lon2,
    Geodesic.DISTANCE
  );
  return s12! / 1000;
};

// compute the distance between two points
export const distance = (a: Coord, b: Coord, geoid: Geoid): number => {
  switch (geoid) {
    case Geoid.SPHERE:
      return turfDist(a, b, { units: 'kilometers' });
    case Geoid.WGS84:
      return wgs84Dist(a, b);
    default:
      throw new Error(`Unknown geoid ${geoid}`);
  }
};

// given a geodetic line segment, compute some points on the line so that
// it is extended to wrap around the globe when drawn in mapping software
export const extendLine = (
  l: LineString | Feature<LineString>
): Feature<LineString> => {
  const coords: Position[] = getCoords(l);
  if (coords.length !== 2) {
    return lineString(coords);
  }
  const [[lona, lata], [lonb, latb]] = coords;
  const ab = Geodesic.WGS84.InverseLine(
    lata,
    lona,
    latb,
    lonb,
    Geodesic.STANDARD | Geodesic.DISTANCE_IN
  );
  const c = ab.ArcPosition(120, Geodesic.LATITUDE | Geodesic.LONGITUDE);
  const d = ab.ArcPosition(-120, Geodesic.LATITUDE | Geodesic.LONGITUDE);
  return lineString([
    [lona, lata],
    [c.lon2!, c.lat2!],
    [d.lon2!, d.lat2!],
    [lona, lata],
  ]);
};
