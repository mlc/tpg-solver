import { FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { lineString, point } from '@turf/helpers';
import { Geodesic } from 'geographiclib-geodesic';
import type { Feature, Point } from 'geojson';
import { GameMode, Geoid } from '../game-modes';
import { selectGameConfig } from '../gameConfig';
import { gcFmtFeature, gcFmtLine, gcUrl } from '../gcmap';
import { createAppSelector, useAppSelector } from '../store';
import { PairwiseComputer, SPHERICAL_EARTH, distance } from '../util';
import { Data } from './DataCell';
import { PositionDisplay } from './PositionCell';
import { stringify } from './util';

const selectPairwiseComputer = createAppSelector(
  [
    (store) => store.data.photos,
    (store) => store.data.secondPhotos,
    (store) => store.data.error,
  ],
  (photos, secondPhotos, error) =>
    error || !photos
      ? null
      : new PairwiseComputer(photos, secondPhotos ?? undefined)
);

const PairPhoto: FunctionComponent<{ photo: Feature<Point> }> = ({ photo }) => (
  <li>
    <PositionDisplay coord={photo.geometry} />
    {Object.entries(photo.properties ?? {}).map(([key, value]) => (
      <>
        <br />
        <span key={key}>
          {`${key}: `}
          <Data data={value} />
        </span>
      </>
    ))}
  </li>
);

const PairResult: FunctionComponent<{
  result: [Feature<Point>, Feature<Point>];
  target?: Feature<Point>;
}> = ({ result, target }) => {
  const [p0, p1] = result;
  const [distBetween, distOff, midpoint] = useMemo(() => {
    const s = SPHERICAL_EARTH.InverseLine(
      p0.geometry.coordinates[1],
      p0.geometry.coordinates[0],
      p1.geometry.coordinates[1],
      p1.geometry.coordinates[0],
      Geodesic.STANDARD | Geodesic.DISTANCE_IN
    );
    const midpointPosition = s.Position(
      s.s13 / 2,
      Geodesic.LATITUDE | Geodesic.LONGITUDE
    );
    const midpoint = point([midpointPosition.lon2!, midpointPosition.lat2!]);
    return [
      s.s13 / 1000,
      target ? distance(midpoint, target, Geoid.SPHERE) : 0,
      midpoint,
    ];
  }, [target, p0.geometry.coordinates, p1.geometry.coordinates]);

  const url = gcUrl([
    gcFmtLine([
      p0.geometry.coordinates,
      midpoint.geometry.coordinates,
      p1.geometry.coordinates,
    ]),
    target
      ? gcFmtLine([midpoint.geometry.coordinates, target.geometry.coordinates])
      : '',
  ]);
  return (
    <ul>
      <PairPhoto photo={p0} />
      <PairPhoto photo={p1} />
      <li>
        Midpoint: <PositionDisplay coord={midpoint.geometry} />
      </li>
      <li>
        Distance to target: <a href={url}>{`${distOff.toFixed(3)}\u2009km`}</a>
      </li>
      <li>Distance between photos: {`${distBetween.toFixed(3)}\u2009km`}</li>
    </ul>
  );
};

const MidpointResults = () => {
  const computer = useAppSelector(selectPairwiseComputer);
  const game = useAppSelector(selectGameConfig);
  const result = useMemo(() => {
    if (computer && game?.mode === GameMode.MIDPOINT) {
      return computer.bestMidpointPair(
        game.target,
        game.minDistance ?? undefined
      );
    } else {
      return undefined;
    }
  }, [computer, game]);

  if (result === undefined) {
    return null;
  } else {
    return (
      <>
        <h2>Results</h2>
        {result === null ? (
          <p>No photo pairs satisfy the specified minimum distance.</p>
        ) : (
          <PairResult
            target={game?.mode === GameMode.MIDPOINT ? game?.target : undefined}
            result={result}
          />
        )}
      </>
    );
  }
};

export default MidpointResults;
