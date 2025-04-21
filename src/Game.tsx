import * as React from 'react';
import GameParams from './GameParams';
import { GameMode } from './game-modes';
import { setMode as setModeAction } from './gameSlice';
import { useAppDispatch, useAppSelector } from './store';

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
      [setMode, thisMode]
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
  const mode = useAppSelector((state) => state.game.mode);
  const dispatch = useAppDispatch();
  const setMode = React.useCallback(
    (mode: GameMode) => dispatch(setModeAction(mode)),
    [dispatch, setModeAction]
  );
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
      <GameParams />
    </form>
  );
};

export default Game;
