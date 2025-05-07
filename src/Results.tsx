import * as React from 'react';
import type { FeatureCollection, Point, Position } from 'geojson';
import Icon from './Icon';
import { DistanceProps, decorate, useGameConfig } from './computation';
import { GameMode } from './game-modes';
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

const stringify = (p: unknown) => {
  if (typeof p === 'string') {
    return p;
  } else if (typeof p === 'number') {
    return p.toString();
  } else {
    return '';
  }
};

interface DataCellProps {
  data: any;
}

const DataCell: React.FC<DataCellProps> = ({ data }) => {
  const val = stringify(data);
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

interface DistanceCellProps extends DistanceProps {
  coord: Point;
  extraGc?: string[];
}

const gcFmt = (p: Position): string => {
  const [lng, lat] = p;
  return [
    Math.abs(lat),
    lat >= 0 ? 'N' : 'S',
    Math.abs(lng),
    lng >= 0 ? 'E' : 'W',
  ].join('');
};

const gcFmtLine = (p: Position[]) => p.map(gcFmt).join('-');

const DistanceCell: React.FC<DistanceCellProps> = ({
  distance,
  dest,
  coord,
  extraGc = [],
}) => {
  const km = `${distance.toFixed(3)}\u2009km`;
  const params = new URLSearchParams({
    P: [gcFmtLine([dest.coordinates, coord.coordinates]), ...extraGc].join(','),
    MS: 'wls',
    DU: 'km',
  });
  const url = 'http://www.gcmap.com/mapui?' + params.toString();
  return (
    <td>
      <a href={url}>{km}</a>
    </td>
  );
};

interface GridProps {
  results: FeatureCollection<Point, Record<string, any>>;
  extraGc?: string[];
}

const ResultsGrid: React.FC<GridProps> = ({
  results: { features },
  extraGc,
}) => {
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

const Results: React.FC = () => {
  const game = useGameConfig();
  const photos = useAppSelector((state) => state.data.photos);
  const results = React.useMemo(() => {
    if (game && photos && photos.features.length > 0) {
      return decorate(game, photos);
    } else {
      return null;
    }
  }, [
    game?.mode,
    game?.target,
    game?.geoid,
    game && 'constrainToSegment' in game && game.constrainToSegment,
    photos,
  ]);
  let extraGc: string[] | undefined;
  if (game?.mode === GameMode.LINE) {
    extraGc = [gcFmtLine(game.target.geometry.coordinates)];
  } else if (game?.mode === GameMode.MULTI) {
    extraGc = game.target.features.map((f) => gcFmt(f.geometry.coordinates));
  }
  if (results && results.features.length > 0) {
    return (
      <>
        <h2>Results</h2>
        <ResultsGrid results={results} extraGc={extraGc} />
      </>
    );
  } else {
    return null;
  }
};

export default Results;
