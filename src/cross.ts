import bearing from '@turf/bearing';
import destination from '@turf/destination';
import turfDist from '@turf/distance';
import { Coord, point } from '@turf/helpers';
import { getCoord } from '@turf/invariant';
import { Geodesic } from 'geographiclib-geodesic';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Point,
} from 'geojson';
import { gridDisk, latLngToCell } from 'h3-js';
import { Geoid } from './game-modes';
import { distance } from './util';

interface Index<P extends GeoJsonProperties> {
  idx: Map<string, Feature<Point, P>[]>;
  depth: number;
}

const coordToCell = (coord: Coord, depth: number) => {
  const [lng, lat] = getCoord(coord);
  return latLngToCell(lat, lng, depth);
};

const makeIndex = <P extends GeoJsonProperties>(
  points: FeatureCollection<Point, P>,
  depth = 5
): Index<P> => {
  const idx: Index<P>['idx'] = new Map();
  for (const p of points.features) {
    const cell = coordToCell(p, depth);
    if (idx.has(cell)) {
      idx.get(cell)!.push(p);
    } else {
      idx.set(cell, [p]);
    }
  }
  return { idx, depth };
};

const nearest = <P extends GeoJsonProperties>(
  target: Coord,
  { idx, depth }: Index<P>,
  geoid: Geoid,
  ringSize: number
) => {
  const targetCell = coordToCell(target, depth);
  const neighborCells = gridDisk(targetCell, ringSize);
  const neighbors = neighborCells.flatMap((c) => idx.get(c) ?? []);
  let bestDist = Infinity;
  let bestPoint: Feature<Point, P & { dist: number }> | null = null;
  for (const neighbor of neighbors) {
    const candidateDist = distance(target, neighbor, geoid);
    if (candidateDist < bestDist) {
      bestDist = candidateDist;
      bestPoint = {
        ...neighbor,
        properties: { ...neighbor.properties, dist: candidateDist },
      };
    }
  }
  return bestPoint;
};

function across(
  target: Coord,
  candidate: Coord,
  geoid: Geoid,
  allowFar = true
): Feature<Point> | null {
  const properties =
    'type' in candidate && candidate.type === 'Feature'
      ? candidate.properties
      : {};
  if (geoid === Geoid.SPHERE) {
    const s12 = turfDist(candidate, target, { units: 'kilometers' });
    if (s12 > 10000 && !allowFar) {
      return null;
    } else {
      const azi = bearing(candidate, target);
      return destination(candidate, s12 * 2, azi, {
        units: 'kilometres',
        properties,
      });
    }
  } else {
    const [lon1, lat1] = getCoord(candidate);
    const [lon3, lat3] = getCoord(target);
    const ab = Geodesic.WGS84.InverseLine(
      lat1,
      lon1,
      lat3,
      lon3,
      Geodesic.STANDARD | Geodesic.DISTANCE | Geodesic.DISTANCE_IN
    );
    if (ab.s13 > 10000000 && !allowFar) {
      return null;
    } else {
      const result = ab.Position(
        ab.s13 * 2,
        Geodesic.LATITUDE | Geodesic.LONGITUDE
      );
      return point([result.lon2!, result.lat2!], properties);
    }
  }
}

interface CrossParams {
  points1: FeatureCollection<Point>;
  points2: FeatureCollection<Point>;
  target: Coord;
  geoid?: Geoid;
  allowFar?: boolean;
  ringSize?: number;
}

export const cross = ({
  points1,
  points2,
  target,
  geoid = Geoid.WGS84,
  allowFar = false,
  ringSize = 7,
}: CrossParams) => {
  const idx = makeIndex(points1, 4);
  let bestDist = Infinity;
  let bestPoint: [Feature<Point>, Feature<Point>] | null = null;
  for (const point of points2.features) {
    const projectedPoint = across(target, point, geoid, allowFar);
    const candidate = projectedPoint
      ? nearest(projectedPoint, idx, geoid, ringSize)
      : null;
    if (candidate && candidate.properties.dist < bestDist) {
      bestDist = candidate.properties.dist;
      bestPoint = [point, candidate];
    }
  }
  return bestPoint;
};
