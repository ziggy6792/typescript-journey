/* eslint-disable no-case-declarations */
/* eslint-disable no-fallthrough */
/* eslint-disable no-new */
import path from 'path';
import * as cdk from 'aws-cdk-lib';

import * as config from 'src/config';
import DeploymentStack from './stacks/deployment-stack';
import { PROJECT_NAME } from './utils';

const app = new cdk.App();

const stack = new DeploymentStack(app, PROJECT_NAME, {
  env: {
    account: config.AWS_ACCOUNT_ID,
    region: config.AWS_REGION,
  },
});
