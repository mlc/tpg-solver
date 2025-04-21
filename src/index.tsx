import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Data from './Data';
import Game from './Game';
import Providers from './Providers';
import Results from './Results';
import './style.css';

const App = () => (
  <Providers>
    <h1>tpg solver</h1>
    <Game />
    <Data />
    <Results />
  </Providers>
);

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
