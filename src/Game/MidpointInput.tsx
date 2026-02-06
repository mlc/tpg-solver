import type { GenericEventHandler } from 'preact';
import { useCallback } from 'preact/hooks';
import { setMidpoint, setMidpointMinDist } from '../gameSlice';
import { useAppDispatch, useAppSelector } from '../store';

const BasicInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.midpointText);
  const onChange: GenericEventHandler<HTMLInputElement> = useCallback(
    (evt) => dispatch(setMidpoint(evt.currentTarget.value)),
    [dispatch]
  );

  const minText = useAppSelector((state) => state.game.midpointMinDistText);
  const onMinChange: GenericEventHandler<HTMLInputElement> = useCallback(
    (evt) => dispatch(setMidpointMinDist(evt.currentTarget.value)),
    [dispatch]
  );

  return (
    <>
      <label>
        Target coordinates:
        <input name="midpoint" onChange={onChange} value={text} />
      </label>
      <br />
      <label>
        Minimum distance between photos:
        <input
          name="midpointMinDist"
          class="shorter"
          type="text"
          onChange={onMinChange}
          value={minText}
        />
        &nbsp;km
      </label>
    </>
  );
};

export default BasicInput;
