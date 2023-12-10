import path from 'path';
import { Bucket, NextjsSite, StackContext, use } from 'sst/constructs';
import { commonUtils } from '@ts-journey/common';
import { AuthStack } from './AuthStack';

export function NextApp({ app, stack }: StackContext) {
  const { auth } = use(AuthStack);

  const { userPoolClientId, userPoolClientSecret } = auth.cdk.userPoolClient;

  const bucket = new Bucket(stack, 'file-uploads', { name: commonUtils.getS3BucketName(commonUtils.BucketName.FILE_UPLOADS, app.stage) });

  const site = new NextjsSite(stack, 'next-app', {
    path: path.join(require.resolve('@ts-journey/next-app'), '..'),
    buildCommand: 'yarn open:next:build',
    bind: [bucket],
    environment: {
      COGNITO_CLIENT_ID: userPoolClientId,
      COGNITO_CLIENT_SECRET: userPoolClientSecret.toString(),
      COGNITO_ISSUER: `https://cognito-idp.ap-southeast-1.amazonaws.com/${auth.userPoolId}`,
    },
    experimental: {
      streaming: true,
    },
  });

  stack.addOutputs({
    url: site.url,
  });
}
