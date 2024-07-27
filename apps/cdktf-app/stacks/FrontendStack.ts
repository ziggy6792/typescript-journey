import { Construct } from 'constructs';
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf';
import * as path from 'path';
import { provider } from '@cdktf/provider-aws';
import { S3DirDeploy2 } from '../constucts/S3DirDeploy2';
import { SimpleStaticSite } from '../constucts/SimpleStaticSite';
import { StaticSite } from '../constucts/StaticSite';
import { AwsBaseStack } from './AwsBaseStack';

export class FrontendStack extends AwsBaseStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const simpleStaticSite = new SimpleStaticSite(this, 'simple-static-site', {
      path: path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist')),
    });

    // Output the S3 Website URL
    new TerraformOutput(this, 'simpleWebsiteUrl', {
      value: simpleStaticSite.url,
    });

    new TerraformOutput(this, 'simpleWebsiteBucket', {
      value: simpleStaticSite.bucket.bucket,
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

    const s3DirDeploy2 = new S3DirDeploy2(this, 's3-dir-deploy-2', {
      path: path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist')),
    });

    new TerraformOutput(this, 's3DirDeploy2Bucket', {
      value: s3DirDeploy2.bucket.bucket,
    });
  }
}
