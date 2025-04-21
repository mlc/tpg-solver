import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Game from './Game';
import './style.css';
import Providers from './Providers';
import Data from './Data';
import Results from './Results';

const App = () => (
  <Providers>
    <h1>tpg solver</h1>
    <Game />
    <Data />
    <Results />
  </Providers>
);

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
