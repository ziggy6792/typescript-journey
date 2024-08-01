import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import { TerraformStateBackend } from '../constucts/TerraformStateBackend';

export interface PreReqStackProps {
  backendId: string;
  stage: string;
}

export class PreReqStack extends TerraformStack {
  constructor(scope: Construct, id: string, { backendId }: PreReqStackProps) {
    super(scope, id);

    new provider.AwsProvider(this, 'aws-provider', {
      region: 'ap-southeast-1',
    });

    new TerraformStateBackend(this, 'terraform-sate-backend', {
      bucketName: backendId,
      dynamodbTableName: backendId,
    });
  }
}
