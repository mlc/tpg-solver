import * as React from 'react';
import { FeatureCollection, Point } from 'geojson';
import Icon from './Icon';
import { decorate, useGameConfig } from './computation';
import { useAppSelector } from './store';
import { formatCoord } from './util';

// https://stackoverflow.com/a/9284473
const URL_REGEX =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

interface PositionCellProps {
  coord: Point;
}

const PositionCell: React.FC<PositionCellProps> = ({ coord }) => {
  const stringCoord = formatCoord(coord);
  const params = new URLSearchParams({
    api: '1',
    query: [coord.coordinates[1], coord.coordinates[0]].join(','),
  });
  const url = 'https://www.google.com/maps/search/?' + params.toString();
  return (
    <td className="position">
      <a href={url}>{stringCoord}</a>
      <Icon
        name="copy"
        label="Copy coordinates"
        onClick={() => {
          navigator.clipboard.writeText(stringCoord).catch(console.error);
        }}
      />
    </td>
  );
};

const stringify = (p: unknown, hint: string) => {
  if (typeof p === 'string') {
    return p;
  } else if (typeof p === 'number') {
    return hint === 'distance' ? `${p.toFixed(3)}\u2009km` : p.toString();
  } else {
    return '';
  }
};

interface DataCellProps {
  data: any;
  hint: string;
}

const DataCell: React.FC<DataCellProps> = ({ data, hint }) => {
  const val = stringify(data, hint);
  const isUrl = URL_REGEX.test(val);
  if (isUrl) {
    return (
      <td>
        <a href={val}>{val}</a>
      </td>
    );
  } else {
    return <td>{val}</td>;
  }
};

interface GridProps {
  results: FeatureCollection<Point, Record<string, any>>;
}

const ResultsGrid: React.FC<GridProps> = ({ results: { features } }) => {
  const headers = Object.keys(features[0].properties);
  return (
    <table id="results-grid">
      <thead>
        <tr>
          <th>Position</th>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {features.map((feature) => (
          <tr key={feature.id}>
            <PositionCell coord={feature.geometry} />
            {headers.map((h) => (
              <DataCell key={h} data={feature.properties[h]} hint={h} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Results: React.FC = () => {
  const game = useGameConfig();
  const photos = useAppSelector((state) => state.data.photos);
  const results = React.useMemo(() => {
    if (game && photos && photos.features.length > 0) {
      return decorate(game, photos);
    } else {
      return null;
    }
  }, [game?.mode, game?.target, game?.geoid, photos]);
  if (results && results.features.length > 0) {
    return (
      <>
        <h2>Results</h2>
        <ResultsGrid results={results} />
      </>
    );
  } else {
    return null;
  }
};

export default Results;
