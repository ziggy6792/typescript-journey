import { Construct } from 'constructs';
import { App, S3Backend, TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new provider.AwsProvider(this, 'AWS', {
      region: 'ap-southeast-1',
    });

    // Only one backend is supported by Terraform
    // S3 Backend - https://www.terraform.io/docs/backends/types/s3.html
    new S3Backend(this, {
      bucket: 'cdktf-aws-demo-bucket',
      region: 'ap-southeast-1',
      key: 'state',
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
