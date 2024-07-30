import { Construct } from 'constructs';
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf';
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
import { getConstuctName, getUniqueId } from '../utils/util';

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

    const lambdaPath = path.join(require.resolve('@ts-journey/api'), '..');

    const zipPath = path.join(process.env.INIT_CWD!, `/out/${getUniqueId(this, lambdaFunctionName)}.zip`);

    const zippedLambda = new archive.dataArchiveFile.DataArchiveFile(this, 'lambdaMyFunction', {
      type: 'zip',
      sourceDir: lambdaPath,
      outputPath: zipPath,
    });

    // Create IAM role for Lambda
    const lambdaRole = new iamRole.IamRole(this, 'lambda-execution-role', {
      name: getConstuctName(this, `${lambdaFunctionName}-execution-role`),
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
      functionName: getConstuctName(this, lambdaFunctionName),
      handler: 'index.handler',
      runtime: 'nodejs18.x',
      role: lambdaRole.arn,
      filename: zippedLambda.outputPath, // Path to the zip file containing your lambda code
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
