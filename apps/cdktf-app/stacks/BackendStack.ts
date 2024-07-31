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
  lambdaPermission,
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

    const lambdaPath = path.join(path.join(require.resolve('@ts-journey/api'), '../../out/build.zip'));

    // console.log('lambdaPath!', lambdaPath);

    // const fileName = getUniqueId(this, lambdaFunctionName);
    // // const fileName = 'bla';

    // const zipPath = path.join(process.env.INIT_CWD!, `/out/${fileName}.zip`);

    // const zippedLambda = new archive.dataArchiveFile.DataArchiveFile(this, 'lambdaMyFunction', {
    //   type: 'zip',
    //   sourceDir: lambdaPath,
    //   outputPath: zipPath,
    // });

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
      handler: 'index.handler',
      runtime: 'nodejs18.x',
      role: lambdaRole.arn,
      filename: lambdaPath,
      sourceCodeHash: Fn.filebase64sha256(lambdaPath),
      timeout: 30,
    });

    const restApi = new apiGatewayRestApi.ApiGatewayRestApi(this, 'rest-api', {
      name: getConstructName(this, 'rest-api'),
    });

    this.createApiGatewayLambdaMethod('root', restApi, restApi.rootResourceId, apiLambda);

    const proxyResource = new apiGatewayResource.ApiGatewayResource(this, 'proxy-resource', {
      restApiId: restApi.id,
      parentId: restApi.rootResourceId,
      pathPart: '{proxy+}',
    });

    this.createApiGatewayLambdaMethod('proxy-resource', restApi, proxyResource.id, apiLambda);

    // Add Lambda permission to allow API Gateway to invoke the Lambda function
    new lambdaPermission.LambdaPermission(this, 'api-gateway-permission', {
      action: 'lambda:InvokeFunction',
      functionName: apiLambda.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceArn: `${restApi.executionArn}/*/*`,
    });

    const deployment = new apiGatewayDeployment.ApiGatewayDeployment(this, 'deployment', {
      restApiId: restApi.id,
      stageName: 'dev',
      dependsOn: [proxyResource, apiLambda],
    });

    new TerraformOutput(this, 'invokeUrl', {
      value: deployment.invokeUrl,
    });
  }

  private createApiGatewayLambdaMethod(
    idPrefix: string,
    restApi: apiGatewayRestApi.ApiGatewayRestApi,
    resourceId: string,
    apiLambda: lambdaFunction.LambdaFunction
  ) {
    new apiGatewayMethod.ApiGatewayMethod(this, `${idPrefix}-method`, {
      restApiId: restApi.id,
      resourceId,
      httpMethod: 'ANY',
      authorization: 'NONE',
    });

    new apiGatewayIntegration.ApiGatewayIntegration(this, `${idPrefix}-lambda-integration`, {
      restApiId: restApi.id,
      resourceId,
      httpMethod: 'ANY',
      integrationHttpMethod: 'POST',
      type: 'AWS_PROXY',
      uri: apiLambda.invokeArn,
    });
  }
}

const app = new App();
new BackendStack(app, 'DeploymentStack');
app.synth();
