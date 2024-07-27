/* eslint-disable no-new */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
import path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as utils from 'src/utils';
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

import { aws_lambda as lambda, aws_apigateway as apiGateway } from 'aws-cdk-lib';

class DeploymentStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    readonly props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const functionName = 'lambda-api';

    const stageName = 'dev';

    const apiLambda = new lambda.Function(this, utils.getConstructId(functionName), {
      functionName: utils.getConstructName(functionName, stageName),
      description: utils.getConstructName(functionName, stageName),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'packages/lambda-api/dist/index.handler',
      code: lambda.Code.fromAsset(path.join(require.resolve('@ts-journey/api'), '../../out')),
    });

    new apiGateway.LambdaRestApi(this, utils.getConstructName('endpoint'), {
      handler: apiLambda,
    });
  }
}

export default DeploymentStack;
