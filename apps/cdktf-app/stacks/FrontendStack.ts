import { Construct } from 'constructs';
import { TerraformOutput } from 'cdktf';
import * as path from 'path';
import { SimpleStaticSite } from '../constucts/SimpleStaticSite';
import { StaticSite } from '../constucts/StaticSite';
import { AwsBaseStack, AwsBaseStackProps } from './AwsBaseStack';

export class FrontendStack extends AwsBaseStack {
  constructor(
    scope: Construct,
    id: string,
    protected readonly props: AwsBaseStackProps
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

    // Output the CloudFront distribution URL
    new TerraformOutput(this, 'websiteUrl', {
      value: staticStie.url,
    });
  }
}
