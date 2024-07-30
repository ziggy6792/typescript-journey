import { Construct } from 'constructs';
import { App, AssetType, Fn, S3Backend, TerraformAsset, TerraformOutput, TerraformStack } from 'cdktf';
import {
  lambdaFunction,
  apiGatewayRestApi,
  apiGatewayDeployment,
  apiGatewayResource,
  apiGatewayMethod,
  apiGatewayIntegration,
  iamRole,
  iamRolePolicyAttachment,
  provider,
} from '@cdktf/provider-aws';
import * as path from 'path';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import * as archive from '@cdktf/provider-archive';
import { AwsBaseStack } from './AwsBaseStack';
import { getConstructName, getUniqueId } from '../utils/util';

export class BackendStack extends AwsBaseStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new archive.provider.ArchiveProvider(this, 'archive-provider', {});

    const lambdaFunctionName = 'lambda-api';

    new TerraformOutput(this, 'backendOutput', {
      value: 'hello world',
    });

    console.log(path.join(require.resolve('@ts-journey/api'), '..'));

    console.log(process.env.INIT_CWD);

    const lambdaPath = path.join(require.resolve('@ts-journey/api'), '../../out');

    console.log('lambdaPath!', lambdaPath);

    const fileName = getUniqueId(this, lambdaFunctionName);
    // const fileName = 'bla';

    const zipPath = path.join(process.env.INIT_CWD!, `/out/${fileName}.zip`);

    const zippedLambda = new archive.dataArchiveFile.DataArchiveFile(this, 'lambdaMyFunction', {
      type: 'zip',
      sourceDir: lambdaPath,
      outputPath: zipPath,
    });

    // const asset = new TerraformAsset(this, `asset`, {
    //   path: zippedLambda.outputPath,
    //   type: AssetType.FILE,
    // });

    // Create IAM role for Lambda
    const lambdaRole = new iamRole.IamRole(this, 'lambda-execution-role', {
      name: getConstructName(this, `${lambdaFunctionName}-execution-role`),
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      }),
    });

    // Attach policy to the role
    new iamRolePolicyAttachment.IamRolePolicyAttachment(this, 'LambdaExecutionRolePolicy', {
      role: lambdaRole.name,
      policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    });

    const apiLambda = new lambdaFunction.LambdaFunction(this, 'lambda-function', {
      functionName: getConstructName(this, lambdaFunctionName),
      handler: 'apps/lambda-api/dist/index.handler',
      runtime: 'nodejs18.x',
      role: lambdaRole.arn,
      filename: zippedLambda.outputPath,
      sourceCodeHash: Fn.filebase64sha256(zippedLambda.outputPath),
    });

    const restApi = new apiGatewayRestApi.ApiGatewayRestApi(this, 'rest-api', {
      name: getConstructName(this, 'rest-api'),
    });

    const rootAny = new apiGatewayMethod.ApiGatewayMethod(this, 'any-method-1', {
      restApiId: restApi.id,
      resourceId: restApi.rootResourceId,
      httpMethod: 'ANY',
      authorization: 'NONE',
    });

    const apiIntegration1 = new apiGatewayIntegration.ApiGatewayIntegration(this, 'lambda-integration-1', {
      restApiId: restApi.id,
      resourceId: restApi.rootResourceId,
      httpMethod: 'ANY',
      integrationHttpMethod: 'POST',
      type: 'HTTP',
      uri: apiLambda.invokeArn,
    });

    const resource = new apiGatewayResource.ApiGatewayResource(this, 'resource', {
      restApiId: restApi.id,
      parentId: restApi.rootResourceId,
      pathPart: '{proxy+}',
    });

    new apiGatewayMethod.ApiGatewayMethod(this, 'any-method-2', {
      restApiId: restApi.id,
      resourceId: resource.id,
      httpMethod: 'ANY',
      authorization: 'NONE',
    });

    const apiIntegration = new apiGatewayIntegration.ApiGatewayIntegration(this, 'lambda-integration', {
      restApiId: restApi.id,
      resourceId: resource.id,
      httpMethod: 'ANY',
      integrationHttpMethod: 'POST',
      type: 'AWS_PROXY',
      uri: apiLambda.invokeArn,
    });

    // new apiGatewayDeployment.ApiGatewayDeployment(this, 'deployment', {
    //   restApiId: restApi.id,
    //   stageName: 'dev',
    //   dependsOn: [resource, apiLambda, apiIntegration],
    // });
  }
}

const app = new App();
new BackendStack(app, 'DeploymentStack');
app.synth();
