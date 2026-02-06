import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { featureCollection } from '@turf/helpers';
import type { FeatureCollection, Point } from 'geojson';

type Photos = FeatureCollection<Point, Record<string, any>>;

export interface DataState {
  photos: Photos;
  secondPhotos: Photos | null;
  error: string | null;
}

const initialState: DataState = {
  photos: featureCollection([]),
  secondPhotos: null,
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
    setSecondPhotos: (state, action: PayloadAction<Photos | null>) => {
      state.secondPhotos = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setPhotos, setSecondPhotos, setError } = dataSlice.actions;
export default dataSlice.reducer;
