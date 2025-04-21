import turfDist from '@turf/distance';
import type { Coord } from '@turf/helpers';
import { getCoord } from '@turf/invariant';
import DMS from 'geographiclib-dms';
import type { Point } from 'geojson';

// compute the distance between two points
export const distance = (a: Coord, b: Coord): number =>
  turfDist(a, b, { units: 'kilometres' });

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
