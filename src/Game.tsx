import * as React from 'react';
import { GameMode } from './game-modes';

interface ModeProps {
  name: string;
  thisMode: GameMode;
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
}

const Mode: React.FC<ModeProps> = ({
  name,
  thisMode,
  currentMode,
  setMode,
}) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => {
        if (evt.target.value === thisMode) {
          setMode(thisMode);
        }
      },
      [thisMode]
    );

  return (
    <label>
      <input
        type="radio"
        id={`mode-${thisMode}`}
        value={thisMode}
        name="mode"
        checked={thisMode === currentMode}
        onChange={onChange}
      />
      {name}
    </label>
  );
};

const Game: React.FC = () => {
  const [mode, setMode] = React.useState<GameMode>(GameMode.BASIC);

  return (
    <form>
      <h2>Game Mode</h2>
      <p id="mode-selector">
        <Mode
          name="Basic"
          thisMode={GameMode.BASIC}
          currentMode={mode}
          setMode={setMode}
        />
        <Mode
          name="Multi"
          thisMode={GameMode.MULTI}
          currentMode={mode}
          setMode={setMode}
        />
        <Mode
          name="Line"
          thisMode={GameMode.LINE}
          currentMode={mode}
          setMode={setMode}
        />
      </p>
    </form>
  );
};

export default Game;
