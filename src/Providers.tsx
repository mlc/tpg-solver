import * as React from 'react';
import { DEFAULT_GAME, GameProvider } from './game-provider';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GameProvider value={DEFAULT_GAME}>{children}</GameProvider>
);

export default Providers;
