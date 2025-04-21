import * as React from 'react';
import { FeatureCollection, Point } from 'geojson';
import Icon from './Icon';
import { decorate, useGameConfig } from './computation';
import { useAppSelector } from './store';
import { formatCoord } from './util';

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

interface GridProps {
  results: FeatureCollection<Point, Record<string, any>>;
}

const stringify = (p: unknown, hint: string) => {
  if (typeof p === 'string') {
    return p;
  } else if (typeof p === 'number') {
    return hint === 'distance' ? p.toFixed(3) : p.toString();
  } else {
    return '';
  }
};

const ResultsGrid: React.FC<GridProps> = ({ results: { features } }) => {
  const headers = Object.keys(features[0].properties);
  return (
    <table id="results-grid">
      <thead>
        <tr>
          <th>Position</th>
          {headers.map((h) => (
            <th>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {features.map((feature) => (
          <tr>
            <PositionCell coord={feature.geometry} />
            {headers.map((h) => (
              <td>{stringify(feature.properties[h], h)}</td>
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
  }, [game?.mode, game?.target, photos]);
  if (results) {
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
