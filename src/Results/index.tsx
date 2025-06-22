import * as React from 'react';
import { decorate } from '../computation';
import { GameMode } from '../game-modes';
import { useGameConfig } from '../gameConfig';
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
  }, [game, photos]);
  const extraGc = React.useMemo(() => {
    if (game?.mode === GameMode.LINE) {
      if (!game.constrainToSegment) {
        return [
          ...game.target.geometry.coordinates.map(gcFmt),
          'm:-',
          gcFmtLine(extendLine(game.target)),
        ];
      } else {
        return [gcFmtLine(game.target.geometry.coordinates)];
      }
    } else if (game?.mode === GameMode.MULTI) {
      return game.target.features.map((f) => gcFmt(f.geometry.coordinates));
    }
  }, [game]);
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
