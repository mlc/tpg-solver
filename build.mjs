import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import browserslist from 'browserslist';
import * as esbuild from 'esbuild';
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist';
import { randomBytes } from 'node:crypto';
import { readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join as joinPath } from 'node:path';
import * as process from 'node:process';

const dev = process.argv[2] === 'serve';
const deploy = process.argv[2] === 'deploy';

const destDir = joinPath(import.meta.dirname, 'dist');
if (deploy) {
  const dir = await readdir(destDir, { withFileTypes: true }).catch(() => []);
  for (const file of dir) {
    if (file.isFile()) {
      await unlink(joinPath(destDir, file.name));
    }
  }
}

const ctx = await esbuild.context({
  entryPoints: ['src/index.html'],
  outdir: 'dist',
  outbase: 'src',
  legalComments: 'linked',
  sourcemap: dev ? 'inline' : 'linked',
  bundle: true,
  minify: !dev,
  chunkNames: '[dir]/[name]-[hash]',
  platform: 'browser',
  plugins: [
    htmlPlugin({ minifyOptions: { minifySvg: false } }),
    //postCssPlugin({ plugins: [postcssPresetEnv()] }),
  ],
  charset: 'utf8',
  define: {
    DEBUG: JSON.stringify(dev),
    'process.env.NODE_ENV': dev ? '"development"' : '"production"',
  },
  target: resolveToEsbuildTarget(browserslist()),
  loader: { '.woff2': 'file' },
  metafile: !dev,
});

if (dev) {
  await ctx.serve({ servedir: 'dist' });
} else {
  const { metafile } = await ctx.rebuild();
  await Promise.all([
    ctx.dispose(),
    writeFile('meta.json', JSON.stringify(metafile), 'utf-8'),
  ]);
}

const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css;charset=utf-8',
  '.map': 'application/json',
  '.txt': 'text/plain;charset=utf-8',
  '.html': 'text/html;charset=utf-8',
  '.woff2': 'font/woff2',
};

if (deploy) {
  const cf = new CloudFormationClient({ region: 'us-east-1' });
  const s3 = new S3Client({ region: 'us-east-1' });
  const cloudfront = new CloudFrontClient({ region: 'us-east-1' });
  const Bucket = 'tpg.makeinstallnotwar.org';

  const stack = await cf.send(
    new DescribeStacksCommand({ StackName: 'TpgSolverStack' })
  );
  if (stack.Stacks.length !== 1) {
    throw new Error('no stack');
  }
  const DistributionId = stack.Stacks[0].Outputs.find(
    ({ OutputKey }) => OutputKey === 'distributionid'
  )?.OutputValue;

  if (!DistributionId) {
    throw new Error('no distribution output');
  }
  const dir = await readdir(destDir, { withFileTypes: true });
  for (const file of dir) {
    if (file.isFile() && !file.name.endsWith('.html')) {
      const ContentType = mimeTypes[extname(file.name)];
      console.log(file.name, ContentType);
      const Body = await readFile(joinPath(destDir, file.name));
      await s3
        .send(
          new PutObjectCommand({
            Bucket,
            Key: file.name,
            CacheControl: 'public,max-age=15552000,immutable',
            ContentType,
            IfNoneMatch: '*',
            Body,
            ChecksumAlgorithm: 'SHA256',
          })
        )
        .catch((e) => {
          if (
            typeof e === 'object' &&
            e !== null &&
            e.Code === 'PreconditionFailed' &&
            e.Condition === 'If-None-Match'
          ) {
            console.info('already exists');
          } else {
            throw e;
          }
        });
    }
  }
  console.log('index.html');
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: 'index.html',
      CacheControl: 'public,max-age=3600',
      ContentType: mimeTypes['.html'],
      Body: await readFile(joinPath(destDir, 'index.html')),
      ChecksumAlgorithm: 'SHA256',
    })
  );

  const invalidation = await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: 2,
          Items: ['/', '/index.html'],
        },
        CallerReference: randomBytes(24).toString('hex'),
      },
    })
  );
  console.log(invalidation);
}
