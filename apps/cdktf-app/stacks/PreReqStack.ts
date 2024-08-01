import { Construct } from 'constructs';
import { TerraformOutput, TerraformStack } from 'cdktf';
import { dataAwsCallerIdentity, provider } from '@cdktf/provider-aws';
import { TerraformStateBackend } from '../constucts/TerraformStateBackend';

export interface PreReqStackProps {
  bucketNamePrefix: string;
  stage: string;
}

export class PreReqStack extends TerraformStack {
  public readonly bucketName: string;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: PreReqStackProps
  ) {
    super(scope, id);

    // const current = new dataAwsCallerIdentity.DataAwsCallerIdentity(this, 'aws-caller-identity', {});

    new provider.AwsProvider(this, 'aws-provider', {
      region: 'ap-southeast-1',
    });

    const backendId = [props.bucketNamePrefix, props.stage, '932244219675'].join('-');

    this.bucketName = backendId;

    new TerraformStateBackend(this, 'terraform-sate-backend', {
      bucketName: backendId,
      dynamodbTableName: backendId,
    });
  }
}
