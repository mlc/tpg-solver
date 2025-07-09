import { FunctionComponent } from 'preact';
import type { FeatureCollection, Point } from 'geojson';
import DataCell from './DataCell';
import DistanceCell from './DistanceCell';
import PositionCell from './PositionCell';

interface Props {
  results: FeatureCollection<Point, Record<string, any>>;
  extraGc?: string[];
}

const Grid: FunctionComponent<Props> = ({ results: { features }, extraGc }) => {
  const headers = Object.keys(features[0].properties).filter(
    (h) => !['distance', 'dest'].includes(h)
  );
  return (
    <table id="results-grid">
      <thead>
        <tr>
          <th>Position</th>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
          <th>Distance</th>
        </tr>
      </thead>
      <tbody>
        {features.map((feature) => (
          <tr key={feature.id}>
            <PositionCell coord={feature.geometry} />
            {headers.map((h) => (
              <DataCell key={h} data={feature.properties[h]} />
            ))}
            <DistanceCell
              coord={feature.geometry}
              distance={feature.properties.distance}
              dest={feature.properties.dest}
              extraGc={extraGc}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Grid;
