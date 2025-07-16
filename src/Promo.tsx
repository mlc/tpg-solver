import type { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const dayLeftString = (days: number): string => {
  if (days === 0) {
    return 'Less than a day left!';
  } else if (days === 1) {
    return 'Just one day left!';
  } else {
    return `Just ${days} days left!`;
  }
};

const computeDaysLeft = () => {
  const now = Date.now();
  return Math.floor((1752714000000 - now) / 86_400_000);
};

const Promo: FunctionComponent = () => {
  const [daysLeft, setDaysLeft] = useState(computeDaysLeft);
  useEffect(() => {
    const intervalId = setInterval(
      () => setDaysLeft(computeDaysLeft()),
      60_000
    );
    return () => clearInterval(intervalId);
  }, []);
  if (daysLeft < 0) {
    return null;
  } else {
    return (
      <p class="votenote">
        <strong class={daysLeft < 2 ? 'verystrong' : undefined}>
          {dayLeftString(daysLeft)}
        </strong>
        {' Please consider '}
        <a target="_blank" href="https://www.youtube.com/shorts/4h8mYt6qnlw">
          voting for Jaspinko in the GeoGuessr Remix challenge
        </a>
        !
      </p>
    );
  }
};

export default Promo;
