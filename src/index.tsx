import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Game from './Game';
import './style.css';
import Providers from './Providers';
import Data from './Data';

const App = () => (
  <Providers>
    <h1>tpg solver</h1>
    <Game />
    <Data />
  </Providers>
);

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
