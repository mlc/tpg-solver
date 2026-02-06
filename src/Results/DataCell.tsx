import type { FunctionComponent } from 'preact';
import Icon from '../Icon';
import { stringify } from './util';

// https://stackoverflow.com/a/9284473
const URL_REGEX =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

interface Props {
  data: any;
}

export const Data: FunctionComponent<Props> = ({ data }: Props) => {
  const val = stringify(data);
  const isUrl = URL_REGEX.test(val);
  if (typeof data === 'boolean') {
    return <Icon name={data ? 'check' : 'xmark'} label={String(data)} />;
  } else if (isUrl) {
    return <a href={val}>{val}</a>;
  } else {
    return val;
  }
};

const DataCell: FunctionComponent<Props> = ({ data }) => (
  <td>
    <Data data={data} />
  </td>
);

export default DataCell;
