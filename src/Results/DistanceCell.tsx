import { FunctionComponent } from 'preact';
import type { Point } from 'geojson';
import { DistanceProps } from '../computation';
import { gcFmtLine, gcUrl } from '../gcmap';

interface Props extends DistanceProps {
  coord: Point;
  extraGc?: string[];
}

const DistanceCell: FunctionComponent<Props> = ({
  distance,
  dest,
  coord,
  extraGc = [],
}) => {
  const km = `${distance.toFixed(3)}\u2009km`;
  const url = gcUrl([
    gcFmtLine([dest.coordinates, coord.coordinates]),
    ...extraGc,
  ]);
  return (
    <td>
      <a href={url}>{km}</a>
    </td>
  );
};

export default DistanceCell;
