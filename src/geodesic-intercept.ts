import { Coord, point } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import * as geodesic from 'geographiclib-geodesic';
import type { Feature, LineString, Position } from 'geojson';

// @ts-ignore
const R: number = geodesic.Constants.WGS84.a;

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

/*
 * Compute the minimum distance from a point P to a Geodesic AB
 * on the ellipsoid.
 *
 * The method is from Basegla and Martínez-Llario[1], with the
 * refinement suggested by Karney[2].
 *
 * [1] https://www.researchgate.net/publication/321358300_Intersection_and_point-to-line_solutions_for_geodesics_on_the_ellipsoid
 * [2] https://arxiv.org/pdf/2308.00495
 */

const geodesicIntercept = (
  line: LineString | Feature<LineString>,
  p: Coord
) => {
  const coordinates = getCoords(line);
  if (coordinates.length !== 2) {
    throw new Error('not presently supported');
  }

  let [[lona, lata], [lonb, latb]] = coordinates;
  const [lonp, latp] = getCoord(p);

  for (let i = 0; i < 10; ++i) {
    const ap = geodesic.Geodesic.WGS84.Inverse(
      lata,
      lona,
      latp,
      lonp,
      geodesic.Geodesic.DISTANCE | geodesic.Geodesic.AZIMUTH
    );
    const sAP = ap.s12!;
    const alphaAP = ap.azi1!;
    const ab = geodesic.Geodesic.WGS84.InverseLine(
      lata,
      lona,
      latb,
      lonb,
      geodesic.Geodesic.STANDARD | geodesic.Geodesic.DISTANCE_IN
    );
    const alphaAB = ab.azi1 as number;
    const Alpha: number = geodesic.Math.AngDiff(alphaAP, alphaAB).d;
    const { c: cosAlpha } = geodesic.Math.sincosd(Alpha);
    const sAX = R * Math.atan2(Math.sin(sAP / R) * cosAlpha, Math.cos(sAP / R));
    const a2 = ab.Position(
      sAX,
      geodesic.Geodesic.LATITUDE | geodesic.Geodesic.LONGITUDE
    );
    lata = a2.lat2;
    lona = a2.lon2;
    if (Math.abs(sAX) < 0.0001) {
      break;
    }
  }

  return decoratedPoint(getCoord(p), [lona, lata]);
};

export default geodesicIntercept;
