import { featureCollection, point } from '@turf/helpers';
import { collectionOf } from '@turf/invariant';
import type { FeatureCollection, Point } from 'geojson';
import Papa from 'papaparse';

const readFile = (f: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', (e) => reject('Could not read file'));
    reader.readAsText(f);
  });

const parseJson = (json: string): FeatureCollection<Point> => {
  const result = JSON.parse(json);
  collectionOf(result, 'Point', 'parseJson');
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

  console.log(latCol, lngCol);

  return featureCollection(
    result.data.map((row) => {
      const { [latCol]: lat, [lngCol]: lng, ...rest } = row;
      return point([Number(lng), Number(lat)], rest);
    })
  );
};

const isJson = (data: string, type: string) =>
  type.includes('json') || data[0] === '{' || data[0] === '[';

const parseData = async (f: Blob): Promise<FeatureCollection<Point>> => {
  const data = await readFile(f);
  if (data.length === 0) {
    throw new Error('Empty file');
  } else if (isJson(data, f.type)) {
    return parseJson(data);
  } else {
    console.log('csv');
    return parseCsv(data);
  }
};

export default parseData;
