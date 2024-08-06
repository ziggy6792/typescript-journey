import { Construct } from 'constructs';
import { Fn, TerraformOutput } from 'cdktf';
import * as path from 'path';
import { s3Bucket, s3Object } from '@cdktf/provider-aws';
import * as fs from 'fs';
import { SimpleStaticSite } from '../constucts/SimpleStaticSite';
import { StaticSite } from '../constucts/StaticSite';
import { AwsBaseStack, AwsBaseStackProps } from './AwsBaseStack';

interface FrontendStackProps extends AwsBaseStackProps {
  apiUrl: string;
}

export class FrontendStack extends AwsBaseStack {
  constructor(
    scope: Construct,
    id: string,
    protected readonly props: FrontendStackProps
  ) {
    super(scope, id, props);

    const simpleStaticSite = new SimpleStaticSite(this, 'simple-static-site', {
      path: path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist')),
    });

    // Output the S3 Website URL
    new TerraformOutput(this, 'simpleWebsiteUrl', {
      value: simpleStaticSite.url,
    });

    const staticStie = new StaticSite(this, 'static-site', {
      path: path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist')),
    });

    const content = {
      CDKTF_API_URL: props.apiUrl,
    };

    const envConfig = JSON.stringify(content);

    new s3Object.S3Object(this, 'env-config', {
      bucket: staticStie.bucket.bucket,
      key: 'config/env.json',
      content: envConfig,
      contentType: 'application/json',
    });

    // Output the CloudFront distribution URL
    new TerraformOutput(this, 'websiteUrl', {
      value: staticStie.url,
    });

    // Output the CloudFront distribution URL
    new TerraformOutput(this, 'apiUrl', {
      value: props.apiUrl,
    });
  }
}
