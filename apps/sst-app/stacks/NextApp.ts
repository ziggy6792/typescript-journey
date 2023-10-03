import path from 'path';
import { NextjsSite, StackContext, use } from 'sst/constructs';
import { AuthStack } from './AuthStack';

export function NextApp({ stack }: StackContext) {
  // Create auth provider
  const { auth } = use(AuthStack);

  //   COGNITO_CLIENT_ID=2suj11499pf203d7a1tamsfql0
  // COGNITO_CLIENT_SECRET=1gngqg7isk11789gm84k5lnuuvk1cn3g8nf4i5041ukprgfdse3i
  // COGNITO_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_2tevBbomk

  const { userPoolClientId, userPoolClientSecret } = auth.cdk.userPoolClient;

  const site = new NextjsSite(stack, 'next-app', {
    path: path.join(require.resolve('@ts-journey/next-app'), '..'),
    buildCommand: 'yarn open:next:build',
    bind: [],
    environment: {
      COGNITO_CLIENT_ID: userPoolClientId,
      COGNITO_CLIENT_SECRET: userPoolClientSecret.toString(),
      COGNITO_ISSUER: `https://cognito-idp.ap-southeast-1.amazonaws.com/${auth.userPoolId}`,
    },
  });

  stack.addOutputs({
    url: site.url,
  });
}
