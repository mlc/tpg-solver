import { GameMode } from '../game-modes';
import { useAppSelector } from '../store';
import GridResults from './GridResults';
import MidpointResults from './MidpointResults';

const Results = () => {
  const mode = useAppSelector((state) => state.game.mode);
  if (mode === GameMode.MIDPOINT) {
    return <MidpointResults />;
  } else {
    return <GridResults />;
  }
};

export default Results;
