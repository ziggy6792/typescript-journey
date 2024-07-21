import { Construct } from 'constructs';
import { App, S3Backend, TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { S3BucketObject } from '@cdktf/provider-aws/lib/s3-bucket-object';

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

    // Create an S3 bucket
    const bucket = new S3Bucket(this, 'my-bucket', {
      bucket: 'my-cdktf-demo-bucket',
    });

    // Create a text file in the S3 bucket
    new S3BucketObject(this, 'my-bucket-object', {
      bucket: bucket.bucket,
      key: 'hello.txt',
      content: 'Hello, CDK for Terraform!',
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
