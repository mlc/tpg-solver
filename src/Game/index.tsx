import type React from 'react';
import { Selector } from '../Radio';
import { GameMode, Geoid } from '../game-modes';
import { setGeoid, setMode } from '../gameSlice';
import { useAppSelector } from '../store';
import GameParams from './Params';

const Game: React.FC = () => {
  const mode = useAppSelector((state) => state.game.mode);
  const geoid = useAppSelector((state) => state.game.geoid);

  return (
    <form>
      <h2>Game Mode</h2>
      <Selector
        id="mode-selector"
        group="mode"
        current={mode}
        action={setMode}
        values={[
          [GameMode.BASIC, 'Basic'],
          [GameMode.MULTI, 'Multi'],
          [GameMode.LINE, 'Line'],
        ]}
      />
      <GameParams />
      <Selector
        group="geoid"
        current={geoid}
        action={setGeoid}
        values={[
          [Geoid.SPHERE, 'Sphere (Great Circle)'],
          [Geoid.WGS84, 'WGS84 Ellipsoid'],
        ]}
      >
        Datum:
      </Selector>
    </form>
  );
};

export default Game;
