import { Construct } from 'constructs';
import { App, AssetType, S3Backend, TerraformAsset, TerraformOutput, TerraformStack } from 'cdktf';
import { provider, s3BucketWebsiteConfiguration, s3Bucket, s3Object, s3BucketPublicAccessBlock } from '@cdktf/provider-aws';

import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

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
      bucket: 'cdktf-aws-demo-website-bucket-3',
    });

    const publicAccessBlock = new s3BucketPublicAccessBlock.S3BucketPublicAccessBlock(this, 'MyBucketPublicAccessBlock', {
      bucket: myBucket.id,
      blockPublicAcls: false,
      blockPublicPolicy: false,
      ignorePublicAcls: false,
      restrictPublicBuckets: false,
    });

    const oacPolicyDocument = new DataAwsIamPolicyDocument(this, 'oacPolicyDocument', {
      statement: [
        {
          actions: ['s3:GetObject'],
          resources: [`${myBucket.arn}/*`],
          principals: [
            {
              type: 'AWS',
              identifiers: ['*'], // Allows public access
            },
          ],
        },
      ],
    });

    new S3BucketPolicy(this, 's3BucketPolicy', {
      bucket: myBucket.id,
      policy: oacPolicyDocument.json,
      dependsOn: [publicAccessBlock],
    });

    fs.readdirSync(assetPath, { recursive: true }).forEach((file) => {
      if (typeof file !== 'string') return;

      const filePath = path.join(assetPath, file);

      if (fs.statSync(filePath).isDirectory()) return;

      const asset = new TerraformAsset(this, `asset-${file}`, {
        path: filePath,
        type: AssetType.FILE,
      });

      new s3Object.S3Object(this, `object-${file}`, {
        bucket: myBucket.bucket,
        key: file,
        source: asset.path,
        contentType: mime.lookup(file).toString(),
      });
    });

    const myWebsite = new s3BucketWebsiteConfiguration.S3BucketWebsiteConfiguration(this, 'bucket-website', {
      bucket: myBucket.bucket,
      indexDocument: {
        suffix: 'index.html',
      },
      errorDocument: {
        key: '404.html',
      },
    });

    // Output the website URL
    new TerraformOutput(this, 'websiteUrl', {
      value: myWebsite.websiteEndpoint,
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
