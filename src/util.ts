import turfDist from '@turf/distance';
import type { Coord } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import DMS from 'geographiclib-dms';
import { Geodesic } from 'geographiclib-geodesic';
import type { Feature, LineString, Point, Position } from 'geojson';
import { Geoid } from './game-modes';

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
      return turfDist(a, b, { units: 'kilometres' });
    case Geoid.WGS84:
      return wgs84Dist(a, b);
    default:
      throw new Error(`Unknown geoid ${geoid}`);
  }
};

// given a geodetic line segment, compute some points on the line so that
// it is extended to wrap around the globe when drawn in mapping software
export const extendLine = (l: LineString | Feature<LineString>): Position[] => {
  const coords: Position[] = getCoords(l);
  if (coords.length !== 2) {
    return coords;
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
  return [
    [lona, lata],
    [c.lon2!, c.lat2!],
    [d.lon2!, d.lat2!],
    [lona, lata],
  ];
};

export const formatCoord = (pt: Coord): string => {
  const [lng, lat] = getCoord(pt);
  return [
    DMS.Encode(lat, DMS.DEGREE, 5, DMS.LATITUDE),
    DMS.Encode(lng, DMS.DEGREE, 5, DMS.LONGITUDE),
  ].join(' ');
};

export const decodeCoord = (coords: string): Point => {
  const components = coords
    .trim()
    .replace(/ +([NESW])/giu, (_, x) => x)
    .split(/[, ]+/);
  if (components.length !== 2) {
    throw new Error(`unable to parse ${coords}`);
  }
  const { lat, lon } = DMS.DecodeLatLon(...(components as [string, string]));
  return {
    type: 'Point',
    coordinates: [lon, lat],
  };
};

export const stringifyError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'object' && error !== null) {
    return error.toString();
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'Error';
  }
};
