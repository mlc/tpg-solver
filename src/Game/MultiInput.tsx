import {
  ChangeEventHandler,
  ClipboardEventHandler,
  useCallback,
} from 'preact/compat';
import { setMulti } from '../gameSlice';
import { useAppDispatch, useAppSelector } from '../store';

const COORDS_RE = /[+-]?[0-9]+(?:\.?[0-9]+)?[,\s]+[+-]?[0-9]+(?:\.?[0-9]+)?/g;

const MultiInput = () => {
  const dispatch = useAppDispatch();
  const text = useAppSelector((state) => state.game.multiText);
  const onChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (evt) => {
      dispatch(setMulti(evt.currentTarget.value));
    },
    [dispatch]
  );
  const onPaste: ClipboardEventHandler<HTMLTextAreaElement> = useCallback(
    (evt) => {
      const data = evt.clipboardData?.getData('text/plain') ?? '';
      let results: string[] = [];
      for (const result of data.matchAll(COORDS_RE)) {
        results.push(result[0]);
      }
      if (results.length > 0) {
        evt.preventDefault();
        dispatch(setMulti(results.join('\n')));
      }
    },
    [dispatch]
  );
  return (
    <label>
      Target coordinates (one per line):
      <br />
      <textarea
        name="multi"
        value={text}
        onChange={onChange}
        onPaste={onPaste}
      />
    </label>
  );
};

export default MultiInput;
