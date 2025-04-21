import { FeatureCollection, Point } from 'geojson';
import { featureCollection } from '@turf/helpers';
import { collectionOf } from '@turf/invariant';

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

const parseCsv = (csv: string) => featureCollection<Point>([]);

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
