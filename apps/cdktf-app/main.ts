import { Construct } from 'constructs';
import { App, AssetType, S3Backend, TerraformAsset, TerraformStack } from 'cdktf';
import { provider, s3BucketWebsiteConfiguration, s3Bucket, s3DirectoryBucket, s3BucketObject } from '@cdktf/provider-aws';

import * as fs from 'fs';
import * as path from 'path';

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

    // Define a local provisioner to sync the local directory with the S3 bucket
    const asset = new TerraformAsset(this, 'sync-asset', {
      path: '/Users/simon.verhoeven/Documents/workspace/typescript-journey/apps/vite-app/dist',
      type: AssetType.DIRECTORY,
    });

    const myBucket = new s3Bucket.S3Bucket(this, 'my-bucket', {
      bucket: 'cdktf-aws-demo-website-bucket',
    });

    new s3BucketObject.S3BucketObject(this, 's3-bucket-object', {
      // forEach:
      bucket: myBucket.bucket,
      key: asset.fileName,
      source: asset.path, // returns a posix path
    });

    // new s3BucketWebsiteConfiguration.S3BucketWebsiteConfiguration(this, 'bucket-website', {
    //   bucket: myBucket.bucket,
    //   indexDocument: {
    //     suffix: 'index.html',
    //   },
    //   errorDocument: {
    //     key: '5xx.html',
    //   },
    // });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
