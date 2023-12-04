import path from 'path';
import { NextjsSite, StackContext, use } from 'sst/constructs';
import { AuthStack } from './AuthStack';

export function NextApp({ stack }: StackContext) {
  // const { auth } = use(AuthStack);

  // const { userPoolClientId, userPoolClientSecret } = auth.cdk.userPoolClient;

  const site = new NextjsSite(stack, 'next-app', {
    path: path.join(require.resolve('@ts-journey/app-router'), '..'),
    buildCommand: 'yarn open:next:build',
    bind: [],
    environment: {
      COGNITO_CLIENT_ID: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
      COGNITO_CLIENT_SECRET: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      COGNITO_ISSUER: `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_XXXXXXXXX`,
    },
    // experimental: {
    //   streaming: true,
    // },
    logging: 'combined',
  });

  stack.addOutputs({
    url: site.url,
  });
}
