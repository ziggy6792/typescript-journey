import { Construct } from 'constructs';
import * as path from 'path';
import * as archive from '@cdktf/provider-archive';
import { AwsBaseStack, AwsBaseStackProps } from './AwsBaseStack';
import { LambdaFunction } from '../constucts/LambdaFunction';
import { LambdaRestApi } from '../constucts/LambdaRestApi';
import { getConstructName } from '../utils/util';

export class BackendStack extends AwsBaseStack {
  public readonly apiUrl: string;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: AwsBaseStackProps
  ) {
    super(scope, id, props);
    new archive.provider.ArchiveProvider(this, 'archive-provider', {});

    const lambdaPath = path.join(path.join(require.resolve('@ts-journey/api'), '../../out/build.zip'));

    const apiLambdaFunction = new LambdaFunction(this, 'lambda-function', {
      assetPath: lambdaPath,
      functionName: getConstructName(this, 'api'),
    });

    const lambdaRestApi = new LambdaRestApi(this, 'lambda-rest-api', {
      handler: apiLambdaFunction.lambdaFunction,
      stageName: this.getStage(),
    });

    this.apiUrl = lambdaRestApi.url;
  }
}
