import { Construct } from 'constructs';
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf';
import {
  lambdaFunction,
  apiGatewayRestApi,
  apiGatewayDeployment,
  apiGatewayResource,
  apiGatewayMethod,
  apiGatewayIntegration,
  provider,
} from '@cdktf/provider-aws';
import * as path from 'path';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { AwsBaseStack } from './AwsBaseStack';

export class BackendStack extends AwsBaseStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const functionName = 'lambda-api';
    const stageName = 'dev';

    new TerraformOutput(this, 'backendOutput', {
      value: 'hello world',
    });

    // const apiLambda = new lambdaFunction.LambdaFunction(this, 'lambda-api', {
    //   // functionName: utils.getConstructName(functionName, stageName),
    //   // description: utils.getConstructName(functionName, stageName),
    //   // memorySize: 256,
    //   // timeout: 30,
    //   // runtime: 'nodejs18.x',
    //   // handler: 'packages/lambda-api/dist/index.handler',
    //   // filename: path.resolve(require.resolve('@ts-journey/api'), '../../out'),
    //   // sourceCodeHash: '${filebase64sha256("path/to/lambda-zip-file.zip")}',
    // });

    // const restApi = new apiGatewayRestApi.ApiGatewayRestApi(this, utils.getConstructName('endpoint'), {
    //   name: utils.getConstructName('endpoint'),
    // });

    // const resource = new apiGatewayResource.ApiGatewayResource(this, 'Resource', {
    //   restApiId: restApi.id,
    //   parentId: restApi.rootResourceId,
    //   pathPart: '{proxy+}',
    // });

    // new apiGatewayMethod.ApiGatewayMethod(this, 'AnyMethod', {
    //   restApiId: restApi.id,
    //   resourceId: resource.id,
    //   httpMethod: 'ANY',
    //   authorization: 'NONE',
    // });

    // new apiGatewayIntegration.ApiGatewayIntegration(this, 'LambdaIntegration', {
    //   restApiId: restApi.id,
    //   resourceId: resource.id,
    //   httpMethod: 'ANY',
    //   integrationHttpMethod: 'POST',
    //   type: 'AWS_PROXY',
    //   uri: apiLambda.invokeArn,
    // });

    // new apiGatewayDeployment.ApiGatewayDeployment(this, 'Deployment', {
    //   restApiId: restApi.id,
    //   stageName,
    //   dependsOn: [resource, apiLambda],
    // });
  }
}

const app = new App();
new BackendStack(app, 'DeploymentStack');
app.synth();
