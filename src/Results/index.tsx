import * as React from 'react';
import { decorate, useGameConfig } from '../computation';
import { GameMode, Geoid } from '../game-modes';
import { useAppSelector } from '../store';
import { extendLine } from '../util';
import Grid from './Grid';
import { gcFmt, gcFmtLine } from './gcmap';

const Results: React.FC = () => {
  const game = useGameConfig();
  const photos = useAppSelector((state) => state.data.photos);
  const results = React.useMemo(() => {
    if (game && photos && photos.features.length > 0) {
      return decorate(game, photos);
    } else {
      return null;
    }
  }, [
    game?.mode,
    game?.target,
    game?.geoid,
    game && 'constrainToSegment' in game && game.constrainToSegment,
    photos,
  ]);
  let extraGc: string[] | undefined;
  if (game?.mode === GameMode.LINE) {
    if (game.geoid === Geoid.WGS84 && !game.constrainToSegment) {
      extraGc = [
        ...game.target.geometry.coordinates.map(gcFmt),
        'm:-',
        gcFmtLine(extendLine(game.target)),
      ];
    } else {
      extraGc = [gcFmtLine(game.target.geometry.coordinates)];
    }
  } else if (game?.mode === GameMode.MULTI) {
    extraGc = game.target.features.map((f) => gcFmt(f.geometry.coordinates));
  }
  if (results && results.features.length > 0) {
    return (
      <>
        <h2>Results</h2>
        <Grid results={results} extraGc={extraGc} />
      </>
    );
  } else {
    return null;
  }
};

export default Results;
