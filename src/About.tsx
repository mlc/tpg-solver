import * as React from 'react';

const About: React.FC = () => (
  <>
    <h2>About</h2>
    <p className="hint">
      This is a utility for finding your closest photo for several different
      game modes. All computations are performed on your computer and no data is
      transmitted anywhere. If you want to see or modify the source code, feel
      free to{' '}
      <a href="https://github.com/mlc/tpg-solver">have a look on GitHub</a>. For
      any other questions, contact mlc.
    </p>
  </>
);

export default About;
