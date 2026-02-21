import { FunctionComponent } from 'preact';
import Icon from '../Icon';
import { Selector } from '../Radio';
import { GameMode, Geoid } from '../game-modes';
import { setGeoid, setMode } from '../gameSlice';
import { useAppSelector } from '../store';
import GameParams from './Params';

const Game: FunctionComponent = () => {
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
          [GameMode.MIDPOINT, 'Midpoint'],
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
      {geoid === Geoid.WGS84 && mode === GameMode.MIDPOINT ? (
        <p class="note">
          <Icon
            style={{ padding: 0, width: '1em' }}
            name="triangle-exclamation"
            label="Warning"
          />{' '}
          Using midpoint mode with the WGS84 ellipsoid is currently experimental
          and may sometimes miss the best results.
        </p>
      ) : null}
    </form>
  );
};

export default Game;
