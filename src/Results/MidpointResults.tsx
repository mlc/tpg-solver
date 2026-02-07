import { FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { point } from '@turf/helpers';
import { Geodesic } from 'geographiclib-geodesic';
import type { Feature, Point } from 'geojson';
import { GameMode, Geoid } from '../game-modes';
import { selectGameConfig } from '../gameConfig';
import { gcFmtLine, gcUrl } from '../gcmap';
import { createAppSelector, useAppSelector } from '../store';
import { PairwiseComputer, SPHERICAL_EARTH, distance } from '../util';
import DataCell from './DataCell';
import { BaseDistanceCell } from './DistanceCell';
import PositionCell from './PositionCell';

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

interface RowProps {
  p0: Feature<Point>;
  p1: Feature<Point>;
  h0: string[];
  h1: string[];
  target?: Feature<Point>;
}

const PairRow: FunctionComponent<RowProps> = ({ p0, p1, h0, h1, target }) => {
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
    <tr>
      <PositionCell coord={p0.geometry} />
      <PositionCell coord={p1.geometry} />
      <BaseDistanceCell distance={distOff} url={url} />
      {h0.map((h) => (
        <DataCell key={`${p0.id}.${h}`} data={p0.properties?.[h]} />
      ))}
      {h1.map((h) => (
        <DataCell key={`${p1.id}.${h}`} data={p1.properties?.[h]} />
      ))}
    </tr>
  );
};

const PairResults: FunctionComponent<{
  result: [Feature<Point>, Feature<Point>][];
  target?: Feature<Point>;
}> = ({ result, target }) => {
  const p0 = result[0][0].properties;
  const h0 = p0
    ? Object.keys(p0).filter((h) => !['distance', 'dest'].includes(h))
    : [];
  const p1 = result[0][1].properties;
  const h1 = p1
    ? Object.keys(p1).filter((h) => !['distance', 'dest'].includes(h))
    : [];

  return (
    <table id="results-grid">
      <thead>
        <tr>
          <th>Position 1</th>
          <th>Position 2</th>
          <th>Distance</th>
          {h0.map((h) => (
            <th key={`${h}0`}>{h}</th>
          ))}
          {h1.map((h) => (
            <th key={`${h}1`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {result.map(([p0, p1]) => (
          <PairRow
            key={`${p0.id}.${p1.id}`}
            p0={p0}
            p1={p1}
            h0={h0}
            h1={h1}
            target={target}
          />
        ))}
      </tbody>
    </table>
  );
};

const MidpointResults = () => {
  const computer = useAppSelector(selectPairwiseComputer);
  const game = useAppSelector(selectGameConfig);
  const result = useMemo(() => {
    if (computer && game?.mode === GameMode.MIDPOINT) {
      return computer.bestMidpointPairs(
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
        {result === null || result.length === 0 ? (
          <p>No photo pairs satisfy the specified minimum distance.</p>
        ) : (
          <PairResults
            target={game?.mode === GameMode.MIDPOINT ? game?.target : undefined}
            result={result}
          />
        )}
      </>
    );
  }
};

export default MidpointResults;
