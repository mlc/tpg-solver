import { feature, featureCollection, lineString, point } from '@turf/helpers';
import { collectionOf, featureOf, geojsonType } from '@turf/invariant';
import type {
  Feature,
  FeatureCollection,
  GeoJSON,
  Geometry,
  LineString,
  Point,
} from 'geojson';
import Papa from 'papaparse';
import { kml } from './togeojson.mjs';

const readFile = (f: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', (e) => reject('Could not read file'));
    reader.readAsText(f);
  });

const parseJson = <T extends Geometry>(
  json: string,
  type: T['type']
): FeatureCollection<T> => {
  const result = JSON.parse(json);
  collectionOf(result, type, 'parseJson');
  return result;
};

const NUMERIC_RE = /^-?[0-9]+(:?\.[0-9]+)?$/;

const isNumeric = (s: string) => NUMERIC_RE.test(s.trim());

const parseCsv = (csv: string) => {
  const firstRowResult = Papa.parse<string[]>(csv, {
    preview: 1,
    skipEmptyLines: true,
    worker: false,
    download: false,
  });
  let latCol: string;
  let lngCol: string;
  let finalCsv: string;
  if (firstRowResult.data.length === 0) {
    throw new Error('Empty CSV File');
  } else if (
    firstRowResult.data[0].length === 4 &&
    isNumeric(firstRowResult.data[0][0]) &&
    isNumeric(firstRowResult.data[0][1])
  ) {
    // special case for https://tpg.scottytremaine.uk/ exports
    latCol = 'lat';
    lngCol = 'lng';
    finalCsv = 'lat,lng,Label,Image\n' + csv;
  } else {
    const maybeLatCol = firstRowResult.data[0].find((col) => /lat/i.test(col));
    const maybeLngCol = firstRowResult.data[0].find((col) =>
      /lon|lng/i.test(col)
    );
    if (maybeLatCol && maybeLngCol) {
      latCol = maybeLatCol;
      lngCol = maybeLngCol;
      finalCsv = csv;
    } else {
      throw new Error('CSV must contain latitude & longitude columns');
    }
  }
  const result = Papa.parse<Record<string, string>>(finalCsv, {
    worker: false,
    download: false,
    header: true,
    skipEmptyLines: true,
  });

  return featureCollection(
    result.data.map((row) => {
      const { [latCol]: lat, [lngCol]: lng, ...rest } = row;
      return point([Number(lng), Number(lat)], rest);
    })
  );
};

const isJson = (data: string, type: string) =>
  type.includes('json') || data[0] === '{' || data[0] === '[';

export const parseData = async (f: Blob): Promise<FeatureCollection<Point>> => {
  const data = await readFile(f);
  if (data.length === 0) {
    throw new Error('Empty file');
  } else if (isJson(data, f.type)) {
    return parseJson(data, 'Point');
  } else {
    return parseCsv(data);
  }
};

export const parseLineString = async (
  f: Blob
): Promise<Feature<LineString>> => {
  const data = await readFile(f);
  let json: unknown;
  if (data.length === 0) {
    throw new Error('Empty file');
  } else if (isJson(data, f.type)) {
    json = JSON.parse(data);
  } else {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'application/xml');
    json = kml(doc);
  }
  if (Array.isArray(json)) {
    if (json.length === 1) {
      json = json[0];
    } else {
      throw new Error('Only one object allowed');
    }
  }
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid data');
  }
  if (!('type' in json)) {
    throw new Error('Invalid GeoJSON');
  }
  if (json.type === 'FeatureCollection') {
    if (
      'features' in json &&
      Array.isArray(json.features) &&
      json.features.length === 1 &&
      'type' in json.features[0]
    ) {
      json = json.features[0];
    } else {
      throw new Error('Need exactly one feature');
    }
  }
  if ((json as GeoJSON).type === 'LineString') {
    geojsonType(json, 'LineString', 'LineString');
    return feature(json as LineString);
  }
  if ((json as GeoJSON).type === 'Feature') {
    featureOf(json as Feature<any>, 'LineString', 'Feature');
    return json as Feature<LineString>;
  }
  throw new Error('Invalid geometry type');
};
