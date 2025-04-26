import { Coord, point } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import { Math as GMath, Geodesic, GeodesicClass } from 'geographiclib-geodesic';
import type { Feature, LineString, Point, Position } from 'geojson';

interface OutputPointProps {
  s12: number;
  azi1: number;
}

const decoratedPoint = (
  [lonc, latc]: Position,
  [lon, lat]: Position,
  ellipse: GeodesicClass
) => {
  const { s12, azi1 } = ellipse.Inverse(
    latc,
    lonc,
    lat,
    lon,
    Geodesic.AZIMUTH | Geodesic.DISTANCE
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
  p: Coord,
  ellipse = Geodesic.WGS84
): Feature<Point, OutputPointProps> => {
  const coordinates: [number, number][] = getCoords(line);
  if (coordinates.length !== 2) {
    throw new Error('not presently supported');
  }

  const R = ellipse.a;

  let [[lona, lata], [lonb, latb]] = coordinates;
  const [lonp, latp] = getCoord(p);
  let totalSAX = 0;

  const abInitial = ellipse.InverseLine(
    lata,
    lona,
    latb,
    lonb,
    Geodesic.STANDARD | Geodesic.DISTANCE_IN
  );

  for (let i = 0; i < 10; ++i) {
    const ap = ellipse.Inverse(
      lata,
      lona,
      latp,
      lonp,
      Geodesic.DISTANCE | Geodesic.AZIMUTH
    );
    const sAP = ap.s12! / R;
    const alphaAP = ap.azi1!;
    const ab =
      i === 0
        ? abInitial
        : ellipse.InverseLine(
            lata,
            lona,
            latb,
            lonb,
            Geodesic.STANDARD | Geodesic.DISTANCE_IN
          );
    const alphaAB = ab.azi1;
    const { d: Alpha } = GMath.AngDiff(alphaAP, alphaAB);
    const { c: cosAlpha } = GMath.sincosd(Alpha);
    const sAX = R * Math.atan2(Math.sin(sAP) * cosAlpha, Math.cos(sAP));
    if (Math.abs(sAX) < 0.0001) {
      break;
    }
    totalSAX += sAX;
    const a2 = ab.Position(sAX, Geodesic.LATITUDE | Geodesic.LONGITUDE);
    lata = a2.lat2!;
    lona = a2.lon2!;
  }

  let result: [number, number];
  if (totalSAX < 0) {
    result = coordinates[0];
  } else if (totalSAX > abInitial.s13) {
    result = coordinates[1];
  } else {
    result = [lona, lata];
  }
  return decoratedPoint(getCoord(p), result, ellipse);
};

export default geodesicIntercept;
