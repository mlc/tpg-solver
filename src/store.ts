import { useDispatch, useSelector } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import dataReducer from './dataSlice';
import gameReducer from './gameSlice';

const rootReducer = combineReducers({
  game: gameReducer,
  data: dataReducer,
});

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: DEBUG,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
