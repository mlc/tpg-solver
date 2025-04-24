import turfDist from '@turf/distance';
import type { Coord } from '@turf/helpers';
import { getCoord } from '@turf/invariant';
import DMS from 'geographiclib-dms';
import geodesic from 'geographiclib-geodesic';
import type { Point } from 'geojson';
import { Geoid } from './game-modes';

const wgs84Dist = (a: Coord, b: Coord) => {
  const [lon1, lat1] = getCoord(a);
  const [lon2, lat2] = getCoord(b);
  const { s12 } = geodesic.Geodesic.WGS84.Inverse(
    lat1,
    lon1,
    lat2,
    lon2,
    geodesic.Geodesic.DISTANCE
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
