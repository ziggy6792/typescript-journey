import { Construct } from 'constructs';
import { TerraformOutput } from 'cdktf';
import * as path from 'path';
import * as archive from '@cdktf/provider-archive';
import { AwsBaseStack } from './AwsBaseStack';
import { LambdaFunction } from '../constucts/LmbdaFunction';
import { LmbdaRestApi } from '../constucts/LmbdaRestApi';
import { getConstructName } from '../utils/util';

export class BackendStack extends AwsBaseStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new archive.provider.ArchiveProvider(this, 'archive-provider', {});

    const lambdaPath = path.join(path.join(require.resolve('@ts-journey/api'), '../../out/build.zip'));

    const apiLambdaFunction = new LambdaFunction(this, 'lambda-function', {
      assetPath: lambdaPath,
      functionName: getConstructName(this, 'api'),
    });

    const lambdaRestApi = new LmbdaRestApi(this, 'lambda-rest-api', {
      handler: apiLambdaFunction.lambdaFunction,
    });

    new TerraformOutput(this, 'lambdaApiUrl', {
      value: lambdaRestApi.url,
    });
  }
}
