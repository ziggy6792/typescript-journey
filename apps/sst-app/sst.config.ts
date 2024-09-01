/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
import { SSTConfig } from 'sst';
import { ApiStack } from './stacks/ApiStack';
import { ViteApp } from './stacks/ViteApp';
import { AuthStack } from './stacks/AuthStack';
import { NextApp } from './stacks/NextApp';

export default {
  config(_input) {
    return {
      name: 'fish-lambda-poc',
      region: 'ap-southeast-1',
      stage: 'dev',
    };
  },
  stacks(app) {
    app.stack(ApiStack);
    // app.stack(AuthStack);
    // app.stack(AuthStack).stack(NextApp);
    // app.stack(ViteApp);
  },
} satisfies SSTConfig;
