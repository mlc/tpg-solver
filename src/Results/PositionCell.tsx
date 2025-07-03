import type React from 'react';
import type { Point } from 'geojson';
import Icon from '../Icon';
import { formatCoord } from '../util';

interface Props {
  coord: Point;
}

const PositionCell: React.FC<Props> = ({ coord }) => {
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

export default PositionCell;
