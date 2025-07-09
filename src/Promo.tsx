import type { FunctionComponent } from 'preact';

const dayLeftString = (days: number): string => {
  if (days === 0) {
    return 'Less than a day left!';
  } else if (days === 1) {
    return 'Just one day left!';
  } else {
    return `Just ${days} days left!`;
  }
};

const Promo: FunctionComponent = () => {
  const now = Date.now();
  const daysLeft = Math.floor((1752735600000 - now) / (86400 * 1000));
  if (daysLeft < 0) {
    return null;
  } else {
    return (
      <p class="votenote">
        <strong>{dayLeftString(daysLeft)}</strong> Please consider{' '}
        <a target="_blank" href="https://www.youtube.com/shorts/4h8mYt6qnlw">
          voting for Jaspinko in the GeoGuessr Remix challenge
        </a>
        !
      </p>
    );
  }
};

export default Promo;
