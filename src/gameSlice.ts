import { createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { GameMode } from './game-modes';
import {
  feature,
  featureCollection,
  lineString,
  point,
  points,
} from '@turf/helpers';
import { decodeCoord } from './util';

export interface GameState {
  mode: GameMode;
  basicText: string;
  basicTarget: Feature<Point>;
  lineText: [string, string];
  lineTarget: Feature<LineString>;
  multiText: string;
  multiTarget: FeatureCollection<Point>;
  error: string | null;
}

const initialState: GameState = {
  mode: GameMode.BASIC,
  basicText: '',
  basicTarget: point([0, 0]),
  lineText: ['0,0', '0,0'],
  lineTarget: lineString([
    [0, 0],
    [0, 0],
  ]),
  multiText: '',
  multiTarget: points([]),
  error: null,
};

const stringifyError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'object' && error !== null) {
    return error.toString();
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'Error';
  }
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<GameMode>) => {
      state.mode = action.payload;
      state.error = null;
    },
    setBasic: (state, action: PayloadAction<string>) => {
      state.basicText = action.payload;
      try {
        state.basicTarget = feature(decodeCoord(action.payload));
        state.error = null;
      } catch (e) {
        state.error = stringifyError(e);
      }
    },
    setLine0: (state, action: PayloadAction<string>) => {
      state.lineText[0] = action.payload;
    },
    setLine1: (state, action: PayloadAction<string>) => {
      state.lineText[1] = action.payload;
    },
    setMulti: (state, action: PayloadAction<string>) => {
      state.multiText = action.payload;
      try {
        state.multiTarget = featureCollection(
          action.payload.split('\n').map((row) => feature(decodeCoord(row)))
        );
        state.error = null;
      } catch (e) {
        state.error = stringifyError(e);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      ({ type }: UnknownAction) =>
        type === 'game/setLine0' || type === 'game/setLine1',
      (state, action) => {
        try {
          const p0 = decodeCoord(state.lineText[0]);
          const p1 = decodeCoord(state.lineText[1]);
          state.lineTarget = lineString([p0.coordinates, p1.coordinates]);
          state.error = null;
        } catch (e) {
          state.error = stringifyError(e);
        }
      }
    );
  },
});

export const { setMode, setBasic, setLine0, setLine1, setMulti } =
  gameSlice.actions;

export default gameSlice.reducer;
