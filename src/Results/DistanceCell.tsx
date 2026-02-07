import { FunctionComponent } from 'preact';
import type { Point } from 'geojson';
import { DistanceProps } from '../computation';
import { gcFmtLine, gcUrl } from '../gcmap';

interface Props extends DistanceProps {
  coord: Point;
  extraGc?: string[];
}

export const BaseDistanceCell: FunctionComponent<{
  distance: number;
  url: string;
}> = ({ distance, url }) => (
  <td>
    <a href={url}>{`${distance.toFixed(3)}\u2009km`}</a>
  </td>
);

const DistanceCell: FunctionComponent<Props> = ({
  distance,
  dest,
  coord,
  extraGc = [],
}) => {
  const url = gcUrl([
    gcFmtLine([dest.coordinates, coord.coordinates]),
    ...extraGc,
  ]);
  return <BaseDistanceCell distance={distance} url={url} />;
};

export default DistanceCell;
