import { PayloadAction, UnknownAction, createSlice } from '@reduxjs/toolkit';
import {
  feature,
  featureCollection,
  lineString,
  point,
  points,
} from '@turf/helpers';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { GameMode, Geoid } from './game-modes';
import { decodeCoord, formatCoord, stringifyError } from './util';

export interface GameState {
  mode: GameMode;
  basicText: string;
  basicTarget: Feature<Point>;
  lineText: [string, string];
  lineTarget: Feature<LineString>;
  multiText: string;
  multiTarget: FeatureCollection<Point>;
  geoid: Geoid;
  error: string | null;
}

const initialState: GameState = {
  mode: GameMode.BASIC,
  basicText: '0,0',
  basicTarget: point([0, 0]),
  lineText: ['0,0', '0,0'],
  lineTarget: lineString([
    [0, 0],
    [0, 0],
  ]),
  multiText: '',
  multiTarget: points([]),
  geoid: Geoid.SPHERE,
  error: null,
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
          action.payload
            .trim()
            .split('\n')
            .map((row) => feature(decodeCoord(row)))
        );
        state.error = null;
      } catch (e) {
        state.error = stringifyError(e);
      }
    },
    setUploadError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setUploadLine: (
      state,
      { payload: line }: PayloadAction<Feature<LineString>>
    ) => {
      if (line.geometry.coordinates.length === 2) {
        state.lineText = line.geometry.coordinates.map(formatCoord) as [
          string,
          string,
        ];
      } else {
        state.lineText = [
          'Uploaded Line',
          line.properties?.name ?? 'Uploaded Line',
        ];
      }
      state.lineTarget = line;
      state.error = null;
    },
    setGeoid: (state, action: PayloadAction<Geoid>) => {
      state.geoid = action.payload;
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

export const {
  setMode,
  setBasic,
  setLine0,
  setLine1,
  setMulti,
  setUploadLine,
  setUploadError,
  setGeoid,
} = gameSlice.actions;

export default gameSlice.reducer;
