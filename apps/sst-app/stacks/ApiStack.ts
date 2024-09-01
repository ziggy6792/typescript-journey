import { StackContext } from 'sst/constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import path from 'path';
import dotenv from 'dotenv';
import { getConstructName } from '../utils/utility';

dotenv.config({ path: path.join(process.env.PROJECT_CWD, '/.env') });

export function ApiStack({ stack, app }: StackContext) {
  const functionName = 'lambda-api';

  const testLambda = new lambda.Function(stack, functionName, {
    environment: {
      DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    },
    functionName: getConstructName(functionName, app),
    description: getConstructName(functionName, app),
    memorySize: 256,
    timeout: cdk.Duration.seconds(120),
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'dist/index.handler',
    code: lambda.Code.fromAsset(path.join(path.join(require.resolve('@ts-journey/api'), '../../out/build.zip'))),
  });

  stack.addOutputs({
    functionName: testLambda.functionName,
  });
}
