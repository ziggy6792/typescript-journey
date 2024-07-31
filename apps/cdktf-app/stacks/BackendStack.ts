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
} from '@cdktf/provider-aws';
import * as path from 'path';
import * as archive from '@cdktf/provider-archive';
import { AwsBaseStack } from './AwsBaseStack';
import { getConstructName } from '../utils/util';
import { LambdaFunction } from '../constucts/LmbdaFunction';

export class BackendStack extends AwsBaseStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new archive.provider.ArchiveProvider(this, 'archive-provider', {});

    const lambdaFunctionName = 'api';

    const lambdaPath = path.join(path.join(require.resolve('@ts-journey/api'), '../../out/build.zip'));

    const apiLambdaFunction = new LambdaFunction(this, 'lambda-function', {
      assetPath: lambdaPath,
      functionName: lambdaFunctionName,
    });

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

    const restApi = new apiGatewayRestApi.ApiGatewayRestApi(this, 'rest-api', {
      name: getConstructName(this, 'rest-api'),
    });

    this.createApiGatewayLambdaMethod('root', restApi, restApi.rootResourceId, apiLambdaFunction.lambdaFunction);

    const proxyResource = new apiGatewayResource.ApiGatewayResource(this, 'proxy-resource', {
      restApiId: restApi.id,
      parentId: restApi.rootResourceId,
      pathPart: '{proxy+}',
    });

    this.createApiGatewayLambdaMethod('proxy-resource', restApi, proxyResource.id, apiLambdaFunction.lambdaFunction);

    // Add Lambda permission to allow API Gateway to invoke the Lambda function
    new lambdaPermission.LambdaPermission(this, 'api-gateway-permission', {
      action: 'lambda:InvokeFunction',
      functionName: apiLambdaFunction.lambdaFunction.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceArn: `${restApi.executionArn}/*/*`,
    });

    const deployment = new apiGatewayDeployment.ApiGatewayDeployment(this, 'deployment', {
      restApiId: restApi.id,
      stageName: 'dev',
      dependsOn: [proxyResource, apiLambdaFunction.lambdaFunction],
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
