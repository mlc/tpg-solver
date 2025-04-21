import * as esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import postCssPlugin from '@deanc/esbuild-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import * as process from 'node:process';

const dev = process.argv[2] === 'serve';

const ctx = await esbuild.context({
  //target: browserslist(),
  entryPoints: ['src/index.html'],
  outdir: 'dist',
  outbase: 'src',
  legalComments: 'linked',
  sourcemap: dev ? 'inline' : 'linked',
  bundle: true,
  minify: !dev,
  chunkNames: '[dir]/[name]-[hash]',
  platform: 'browser',
  plugins: [htmlPlugin(), postCssPlugin({ plugins: [postcssPresetEnv()] })],
  charset: 'utf8',
  define: {
    DEBUG: JSON.stringify(dev),
    'process.env.NODE_ENV': dev ? '"development"' : '"production"',
  },
  target: ['chrome125', 'firefox118', 'edge133', 'ios15', 'safari17'],
});

if (dev) {
  await ctx.serve({ servedir: 'dist' });
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
