import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { featureCollection } from '@turf/helpers';
import type { FeatureCollection, Point } from 'geojson';

type Photos = FeatureCollection<Point, Record<string, any>>;

export interface DataState {
  photos: Photos;
  error: string | null;
}

const initialState: DataState = {
  photos: featureCollection([]),
  error: null,
};

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setPhotos: (state, action: PayloadAction<Photos>) => {
      state.photos = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setPhotos, setError } = dataSlice.actions;
export default dataSlice.reducer;
