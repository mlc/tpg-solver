import type { Position } from 'geojson';

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
