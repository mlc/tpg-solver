import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Game from './Game';
import './style.css';
import Providers from './Providers';

const App = () => (
  <Providers>
    <h1>tpg solver</h1>
    <Game />
  </Providers>
);

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
