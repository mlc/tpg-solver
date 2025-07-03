import React, { useCallback } from 'react';
import { setBasic } from '../gameSlice';
import { useAppDispatch, useAppSelector } from '../store';

const BasicInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.basicText);
  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => dispatch(setBasic(evt.target.value)),
    [dispatch]
  );

  return (
    <label>
      Target coordinates:
      <input name="basic" onChange={onChange} value={text} />
    </label>
  );
};

export default BasicInput;
