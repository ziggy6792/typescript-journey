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

    // const nextapp = new Nextjs(this, utils.getConstructId('next-app'), {
    //   nextjsPath: path.join(require.resolve('@ts-journey/next-app'), '..'), // relative path to nextjs project root
    //   buildCommand: 'yarn open:next:build',
    //   // ToDo : add cognito auth env
    // });

    // // Or add to SSM and get cognito configs from there at runtime
    // // nextapp.serverFunction.lambdaFunction.role.

    // new cdk.CfnOutput(this, utils.getConstructId('next-app-url'), {
    //   value: nextapp.url,
    //   description: 'The URL of the Next.js application',
    //   exportName: utils.getConstructName('next-app-url'),
    // });

    const functionName = 'lambda-api';

    const stageName = 'dev';

    const apiLambda = new lambda.Function(this, utils.getConstructId(functionName), {
      functionName: utils.getConstructName(functionName, stageName),
      description: utils.getConstructName(functionName, stageName),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'packages/lambda-api/dist/index.handler',
      code: lambda.Code.fromDockerBuild(process.env.PROJECT_CWD!),

      // runtime: lambda.Runtime.FROM_IMAGE,
      // handler: lambda.Handler.FROM_IMAGE,
      // code: lambda.Code.fromAssetImage(process.env.PROJECT_CWD),
    });

    new apiGateway.LambdaRestApi(this, utils.getConstructName('endpoint'), {
      handler: apiLambda,
    });

    // const apiLambda = new lambda.Function(this, utils.getConstructName('api'), {
    //   functionName: utils.getConstructName('api'),
    //   description: utils.getConstructDescription('api'),
    //   memorySize: 256,
    //   timeout: cdk.Duration.seconds(30),
    //   runtime: lambda.Runtime.FROM_IMAGE,
    //   handler: lambda.Handler.FROM_IMAGE,
    //   code: lambda.Code.fromDockerBuild(process.env.PROJECT_CWD),
    //   // code: lambda.Code.fromDockerBuild(path.join(require.resolve('@ts-journey/api'), '../..'),),
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // });
  }
}

export default DeploymentStack;
