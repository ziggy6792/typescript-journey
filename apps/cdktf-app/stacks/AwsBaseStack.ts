import { Construct } from 'constructs';
import { S3Backend, TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';

export interface AwsBaseStackProps {
  stage: string;
  backendBucket: string;
}

export class AwsBaseStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    protected readonly props: AwsBaseStackProps
  ) {
    super(scope, id);

    new provider.AwsProvider(this, 'aws-provider', {
      region: 'ap-southeast-1',
    });

    // Only one backend is supported by Terraform
    // S3 Backend - https://www.terraform.io/docs/backends/types/s3.html
    new S3Backend(this, {
      bucket: props.backendBucket,
      region: 'ap-southeast-1',
      key: id,
    });
  }

  getStage(): string {
    return this.props.stage;
  }
}
