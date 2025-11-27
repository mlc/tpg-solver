import type { FunctionComponent } from 'preact';
import { useCallback } from 'preact/hooks';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Point,
} from 'geojson';
import Icon from '../Icon';
import { selectGameConfig } from '../gameConfig';
import { useAppSelector } from '../store';

interface Props {
  results: FeatureCollection<Point>;
}

const makeRed = <T extends Geometry, P extends GeoJsonProperties>(
  f: Feature<T, P>
) => ({
  ...f,
  properties: { ...f.properties, title: 'Target', 'marker-color': '#f00' },
});

const makePlacements = <P extends GeoJsonProperties>(
  f: Feature<Point, P>,
  i: number
): Feature<Point, P> => {
  if (i >= 9) {
    return f;
  } else {
    return {
      ...f,
      properties: { ...f.properties, 'marker-symbol': i + 1 },
    };
  }
};

const MapLink: FunctionComponent<Props> = ({ results }) => {
  const gameConfig = useAppSelector(selectGameConfig);
  const target = gameConfig?.target;

  const onClick = useCallback(() => {
    const a = document.createElement('a');
    let targets: Feature[];
    if (!target) {
      targets = [];
    } else if (target.type === 'FeatureCollection') {
      targets = target.features;
    } else {
      targets = [target];
    }
    const resultsWithTarget = {
      ...results,
      features: [
        ...targets.map(makeRed),
        ...results.features.slice(0, 100).map(makePlacements),
      ],
    };
    const url =
      'http://geojson.io/#data=data:application/json,' +
      encodeURIComponent(JSON.stringify(resultsWithTarget));
    window.open(url, '_blank');
  }, [results, target]);

  return <Icon name="map-location-dot" onClick={onClick} label="View Map" />;
};

export default MapLink;
