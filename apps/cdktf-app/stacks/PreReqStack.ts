import { Construct } from 'constructs';
import { TerraformOutput, TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import { S3DynamodbRemoteBackend } from '../.gen/modules/s3-dynamodb-remote-backend';

export interface PreReqStackProps {
  bucket: string;
  dynamodbTable: string;
}

export class PreReqStack extends TerraformStack {
  constructor(scope: Construct, id: string, { bucket, dynamodbTable }: PreReqStackProps) {
    super(scope, id);

    new provider.AwsProvider(this, 'aws-provider', {
      region: 'ap-southeast-1',
    });

    new S3DynamodbRemoteBackend(this, 's3-dynamodb-remote-backend', {
      bucket,
      dynamodbTable,
    });

    new TerraformOutput(this, 'bucket', {
      value: bucket,
    });

    new TerraformOutput(this, 'dynamodbTable', {
      value: dynamodbTable,
    });
  }
}
