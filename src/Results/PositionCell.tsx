import type { FunctionComponent } from 'preact';
import { useCallback } from 'preact/compat';
import type { Point } from 'geojson';
import Icon from '../Icon';
import { formatCoord } from '../util';

interface Props {
  coord: Point;
}

export const PositionDisplay: FunctionComponent<Props> = ({ coord }) => {
  const stringCoord = formatCoord(coord);
  const params = new URLSearchParams({
    api: '1',
    query: [coord.coordinates[1], coord.coordinates[0]].join(','),
  });
  const url = 'https://www.google.com/maps/search/?' + params.toString();
  const onCopyClick = useCallback(() => {
    navigator.clipboard.writeText(stringCoord).catch(console.error);
  }, [stringCoord]);
  return (
    <>
      <a href={url}>{stringCoord}</a>
      <Icon name="copy" label="Copy coordinates" onClick={onCopyClick} />
    </>
  );
};

const PositionCell: FunctionComponent<Props> = ({ coord }) => (
  <td class="position">
    <PositionDisplay coord={coord} />
  </td>
);

export default PositionCell;
