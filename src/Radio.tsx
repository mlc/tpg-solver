import type { GenericEventHandler } from 'preact';
import { useCallback } from 'preact/hooks';
import { ActionCreator } from 'redux';
import { useAppDispatch } from './store';

interface Props<T extends string | number> {
  name: string;
  thisMode: T;
  currentMode: T;
  setMode: (mode: T) => void;
  group: string;
  disabled: boolean;
}

export function Radio<T extends string | number>({
  name,
  thisMode,
  currentMode,
  setMode,
  group,
  disabled,
}: Props<T>) {
  const onChange: GenericEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      setMode(thisMode);
    },
    [setMode, thisMode]
  );

  return (
    <label>
      <input
        type="radio"
        id={`${group}-${thisMode}`}
        value={String(thisMode)}
        name={group}
        checked={thisMode === currentMode}
        onChange={onChange}
        disabled={disabled}
      />
      {name}
    </label>
  );
}

interface GroupProps<T extends string | number> {
  id?: string;
  current: T;
  action: ActionCreator<any, [T]>;
  values: [value: T, name: string][];
  group: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Selector<T extends string | number>({
  id,
  current,
  action,
  values,
  group,
  disabled = false,
  children,
}: GroupProps<T>) {
  const dispatch = useAppDispatch();
  const setter = useCallback(
    (value: T) => {
      dispatch(action(value));
    },
    [action, dispatch]
  );

  return (
    <p id={id} class="selector">
      {children}
      {values.map(([value, name]) => (
        <Radio
          key={value}
          name={name}
          thisMode={value}
          currentMode={current}
          setMode={setter}
          disabled={disabled}
          group={group}
        />
      ))}
    </p>
  );
}
