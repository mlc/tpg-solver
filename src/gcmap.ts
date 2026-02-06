import { feature } from '@turf/helpers';
import type { Feature, Position } from 'geojson';

export const gcFmt = (p: Position): string => {
  const [lng, lat] = p;
  return [
    Math.abs(lat),
    lat >= 0 ? 'N' : 'S',
    Math.abs(lng),
    lng >= 0 ? 'E' : 'W',
  ].join('');
};

export const gcFmtLine = (p: Position[]) => p.map(gcFmt).join('-');

export const gcFmtFeature = ({ geometry: g }: Feature): string => {
  switch (g.type) {
    case 'Point':
      return gcFmt(g.coordinates);
    case 'MultiPoint':
      return g.coordinates.map(gcFmt).join(',');
    case 'LineString':
      return gcFmtLine(g.coordinates);
    case 'MultiLineString':
    case 'Polygon':
      return g.coordinates.map(gcFmtLine).join(',');
    case 'MultiPolygon':
      return g.coordinates.flat().map(gcFmtLine).join(',');
    case 'GeometryCollection':
      return g.geometries.map((g) => gcFmtFeature(feature(g))).join(',');
  }
};

export const gcUrl = (P: string | string[]) => {
  const params = new URLSearchParams({
    P: Array.isArray(P) ? P.join(',') : P,
    MS: 'wls',
    DU: 'km',
  });
  return 'http://www.gcmap.com/mapui?' + params.toString();
};
