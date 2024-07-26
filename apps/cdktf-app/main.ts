import { Construct } from 'constructs';
import { App, AssetType, S3Backend, TerraformAsset, TerraformOutput, TerraformStack } from 'cdktf';
import { provider, s3BucketWebsiteConfiguration, s3Bucket, s3Object, s3BucketPublicAccessBlock, cloudfrontDistribution as cfnDist } from '@cdktf/provider-aws';

import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { AcmCertificate } from '@cdktf/provider-aws/lib/acm-certificate';
import { DataAwsCallerIdentity } from '@cdktf/provider-aws/lib/data-aws-caller-identity';
import { StaticSite } from './constucts/StaticSite';

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

    const staticStie = new StaticSite(this, 'static-site', {
      path: path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist')),
    });

    // Output the CloudFront distribution URL
    new TerraformOutput(this, 'websiteUrl', {
      value: staticStie.url,
    });

    new TerraformOutput(this, 'websiteBucket', {
      value: staticStie.bucket.bucket,
    });

    // const staticStie2 = new StaticSite(this, 'static-site-2', {
    //   path: path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist')),
    // });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
