import * as React from 'react';
import type { Point } from 'geojson';
import { DistanceProps } from '../computation';
import { gcFmtLine } from './gcmap';

interface Props extends DistanceProps {
  coord: Point;
  extraGc?: string[];
}

const DistanceCell: React.FC<Props> = ({
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

export default DistanceCell;
