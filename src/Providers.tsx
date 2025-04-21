import * as React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReduxProvider store={store}>{children}</ReduxProvider>
);

export default Providers;
