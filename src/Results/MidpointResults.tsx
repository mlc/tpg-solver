import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import type { Feature, GeoJsonProperties, Point } from 'geojson';
import { GameMode, Geoid } from '../game-modes';
import { selectGameConfig } from '../gameConfig';
import { gcFmtLine, gcUrl } from '../gcmap';
import { createAppSelector, useAppSelector } from '../store';
import { PairwiseComputer } from '../util';
import { type PairwiseOutputItem, filterWgs } from '../util/pairwise';
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
  item: PairwiseOutputItem<GeoJsonProperties>;
  h0: string[];
  h1: string[];
  target?: Feature<Point>;
}

const PairRow: FunctionComponent<RowProps> = ({
  item: { a, b, distance, distBetween, midpoint },
  h0,
  h1,
  target,
}) => {
  if (!midpoint || typeof distance !== 'number') {
    return null;
  }
  const url = gcUrl([
    gcFmtLine([
      a.geometry.coordinates,
      midpoint.geometry.coordinates,
      b.geometry.coordinates,
    ]),
    target
      ? gcFmtLine([midpoint.geometry.coordinates, target.geometry.coordinates])
      : '',
  ]);
  return (
    <tr>
      <PositionCell coord={a.geometry} />
      <PositionCell coord={b.geometry} />
      <BaseDistanceCell distance={distance} url={url} />
      <BaseDistanceCell distance={distBetween} />
      {h0.map((h) => (
        <DataCell key={`${a.id}.${h}`} data={a.properties?.[h]} />
      ))}
      {h1.map((h) => (
        <DataCell key={`${b.id}.${h}`} data={b.properties?.[h]} />
      ))}
    </tr>
  );
};

const PairResults: FunctionComponent<{
  result: PairwiseOutputItem<GeoJsonProperties>[];
  target?: Feature<Point>;
}> = ({ result, target }) => {
  const p0 = result[0].a.properties;
  const h0 = p0
    ? Object.keys(p0).filter((h) => !['distance', 'dest'].includes(h))
    : [];
  const p1 = result[0].b.properties;
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
          <th>Apart</th>
          {h0.map((h) => (
            <th key={`${h}0`}>{h}</th>
          ))}
          {h1.map((h) => (
            <th key={`${h}1`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {result.map((item) => (
          <PairRow
            key={`${item.a.id}.${item.b.id}`}
            item={item}
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
      const basePairs = computer.bestMidpointPairs(
        game.target,
        game.minDistance ?? undefined,
        game.geoid === Geoid.WGS84 ? 2000 : undefined
      );
      return game.geoid === Geoid.WGS84
        ? filterWgs(basePairs, game.target)
        : basePairs;
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
