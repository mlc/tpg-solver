import type { FunctionComponent } from 'preact';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';

const Providers: FunctionComponent = ({ children }) => (
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>{children}</PersistGate>
  </ReduxProvider>
);

export default Providers;
