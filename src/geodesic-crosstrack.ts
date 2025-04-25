import { Coord, point } from '@turf/helpers';
import { getCoord } from '@turf/invariant';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import geodesic from 'geographiclib-geodesic';
import type { LineString, Point, Position } from 'geojson';
import Vector3 from './Vector3';
import Gnomonic from './gnomonic';

// https://doi.org/10.1007/s00190-012-0578-z
// https://sourceforge.net/p/geographiclib/discussion/1026621/thread/299518a3e4/

const gnomonic = new Gnomonic(geodesic.Geodesic.WGS84);

const ptsEqual = (a: Position, b: Position) => {
  if (a.length === 2 && b.length === 2) {
    return a[0] === b[0] && a[1] === b[1];
  } else if (a.length === 3 && b.length === 3) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  } else {
    return false;
  }
};

const decoratedPoint = ([lonc, latc]: Position, [lon, lat]: Position) => {
  const { s12, azi1 } = geodesic.Geodesic.WGS84.Inverse(
    latc,
    lonc,
    lat,
    lon,
    geodesic.Geodesic.AZIMUTH | geodesic.Geodesic.DISTANCE
  );
  return point([lon, lat], { s12: s12!, azi1: azi1! });
};

const geodesicCrosstrack = (line: LineString, p: Coord) => {
  if (line.coordinates.length !== 2) {
    throw new Error('not presently supported');
  }
  const initialGuess = nearestPointOnLine(line, p, { units: 'kilometres' });
  if (
    ptsEqual(initialGuess.geometry.coordinates, line.coordinates[0]) ||
    ptsEqual(initialGuess.geometry.coordinates, line.coordinates[1])
  ) {
    // if the intersection of the great circles is not on the segment, short-circuit
    return decoratedPoint(getCoord(p), initialGuess.geometry.coordinates);
  }

  const [lona, lata] = line.coordinates[0];
  const [lonb, latb] = line.coordinates[1];
  const [lonc, latc] = getCoord(p);
  let [lon, lat] = getCoord(initialGuess);

  for (let i = 0; i < 10; ++i) {
    const va1 = new Vector3(gnomonic.Forward(lat, lon, lata, lona));
    const va2 = new Vector3(gnomonic.Forward(lat, lon, latb, lonb));
    const la = va1.cross(va2);
    const vb1 = new Vector3(gnomonic.Forward(lat, lon, latc, lonc));
    const lb = new Vector3(la.y, -la.x, la.x * vb1.y - la.y * vb1.x);
    const p0 = la.cross(lb).norm();
    const next = gnomonic.Reverse(lat, lon, p0.x, p0.y);
    lat = next.lat;
    lon = next.lon;
  }

  return decoratedPoint([lonc, latc], [lon, lat]);
};

export default geodesicCrosstrack;
