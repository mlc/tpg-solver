/**
 * @license WTFPL
 *             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *   0. You just DO WHAT THE FUCK YOU WANT TO.
 */
import { render } from 'preact';
import About from './About';
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
    <About />
  </Providers>
);

render(<App />, document.getElementById('app')!);
