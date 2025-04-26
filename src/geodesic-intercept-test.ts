import { lineString, point } from '@turf/helpers';
import DMS from 'geographiclib-dms';
import { Feature, LineString, Point, Position } from 'geojson';
import geodesicIntercept from './geodesic-intercept';

// worked examples from Basegla and Martínez-Llario, tables 4–6, plus a
// format function which matches the one used in those tables for ease of
// comparison

const fmt = ([lon, lat]: Position) =>
  [DMS.Encode(lat, DMS.SECOND, 4), DMS.Encode(lon, DMS.SECOND, 4)].join(', ');

const testCases: [Feature<LineString>, Feature<Point>][] = [
  [
    lineString([
      [5, 52],
      [6, 51.4],
    ]),
    point([5.5, 52]),
  ],
  [
    lineString([
      [29, 42],
      [-77, 39],
    ]),
    point([-22, 64]),
  ],
  [
    lineString([
      [29, 42],
      [-70, -35],
    ]),
    point([-22, 64]),
  ],
];

for (const [AB, p] of testCases) {
  console.log(fmt(geodesicIntercept(AB, p).geometry.coordinates));
}
