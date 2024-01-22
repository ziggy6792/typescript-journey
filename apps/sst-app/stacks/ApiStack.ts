import { StackContext } from 'sst/constructs';
import { aws_lambda as lambda, aws_apigateway as apiGateway } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import path from 'path';
import { getConstructName } from '../utils/utility';

export function ApiStack({ stack, app }: StackContext) {
  const functionName = 'lambda-api';

  const apiLambda = new lambda.Function(stack, functionName, {
    functionName: getConstructName(functionName, app),
    description: getConstructName(functionName, app),
    memorySize: 256,
    timeout: cdk.Duration.seconds(30),
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'apps/lambda-api/dist/index.handler',
    code: lambda.Code.fromAsset(path.join(require.resolve('@ts-journey/api'), '../../out')),
  });

  const api = new apiGateway.LambdaRestApi(stack, 'api', {
    handler: apiLambda,
  });

  stack.addOutputs({
    url: api.url,
  });
}
