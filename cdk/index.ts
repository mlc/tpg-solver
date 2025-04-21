import * as cdk from 'aws-cdk-lib';
import { TpgSolverStack } from './TpgSolverStack';

const app = new cdk.App();
new TpgSolverStack(app, 'TpgSolverStack', {
  env: { account: '859317109141', region: 'us-east-1' },
  zone: 'makeinstallnotwar.org',
  subZone: 'tpg',
});
