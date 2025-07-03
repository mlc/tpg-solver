import type { FC, ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';

const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>{children}</PersistGate>
  </ReduxProvider>
);

export default Providers;
