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
      COGNITO_CLIENT_ID: 'pr4ioln8gee6upgfltsq00rie',
      COGNITO_CLIENT_SECRET: 'njjhposu88stcoigf6sj651tuijls8dg1ltfe46b0rp940qh46r',
      COGNITO_ISSUER: `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_dtYlWTzSe`,
    },
    experimental: {
      streaming: true,
    },
  });

  stack.addOutputs({
    url: site.url,
  });
}
