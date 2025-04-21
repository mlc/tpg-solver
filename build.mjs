import * as esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
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
  minify: true,
  chunkNames: '[dir]/[name]-[hash]',
  platform: 'browser',
  plugins: [htmlPlugin()],
  charset: 'utf8',
});

if (dev) {
  await ctx.serve({ servedir: 'dist' });
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
