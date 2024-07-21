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

    const assetPath = '/Users/simon.verhoeven/Documents/workspace/typescript-journey/apps/vite-app/dist';

    const myBucket = new s3Bucket.S3Bucket(this, 'my-bucket', {
      bucket: 'cdktf-aws-demo-website-bucket',
    });

    fs.readdirSync(assetPath, { recursive: true }).forEach((file) => {
      if (typeof file !== 'string') return;

      const filePath = path.join(assetPath, file);

      if (fs.statSync(filePath).isDirectory()) return;

      const asset = new TerraformAsset(this, `asset-${file}`, {
        path: filePath,
        type: AssetType.FILE,
      });

      new s3BucketObject.S3BucketObject(this, `object-${file}`, {
        bucket: myBucket.bucket,
        key: file,
        source: asset.path,
      });
    });

    // new s3BucketObject.S3BucketObject(this, 's3-bucket-object', {
    //   // forEach:
    //   bucket: myBucket.bucket,
    //   key: asset.fileName,
    //   source: asset.path, // returns a posix path
    // });

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
