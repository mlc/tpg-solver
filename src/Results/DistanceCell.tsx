import type { FunctionComponent } from 'preact';
import type { Point } from 'geojson';
import type { DistanceProps } from '../computation';
import { gcFmtLine, gcUrl } from '../gcmap';

interface Props extends DistanceProps {
  coord: Point;
  extraGc?: string[];
}

export const BaseDistanceCell: FunctionComponent<{
  distance: number;
  url?: string;
}> = ({ distance, url }) => {
  const dist = `${distance.toFixed(3)}\u2009km`;
  return <td>{url ? <a href={url}>{dist}</a> : dist}</td>;
};

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
