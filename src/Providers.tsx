import * as React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>{children}</PersistGate>
  </ReduxProvider>
);

export default Providers;
