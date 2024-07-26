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

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const useProvider = new provider.AwsProvider(this, 'AWS', {
      region: 'ap-southeast-1',
    });

    // Only one backend is supported by Terraform
    // S3 Backend - https://www.terraform.io/docs/backends/types/s3.html
    new S3Backend(this, {
      bucket: 'cdktf-aws-demo-bucket',
      region: 'ap-southeast-1',
      key: 'state',
    });

    const myBucket = new s3Bucket.S3Bucket(this, 'my-bucket', {
      bucket: 'cdktf-aws-demo-website-bucket-4',
    });

    // const publicAccessBlock = new s3BucketPublicAccessBlock.S3BucketPublicAccessBlock(this, 'MyBucketPublicAccessBlock', {
    //   bucket: myBucket.id,
    //   blockPublicAcls: false,
    //   blockPublicPolicy: false,
    //   ignorePublicAcls: false,
    //   restrictPublicBuckets: false,
    // });

    // const website = new s3BucketWebsiteConfiguration.S3BucketWebsiteConfiguration(this, 'bucket-website', {
    //   bucket: myBucket.bucket,
    //   indexDocument: {
    //     suffix: 'index.html',
    //   },
    //   errorDocument: {
    //     key: '404.html',
    //   },
    // });

    const spaPath = path.join(path.join(require.resolve('@ts-journey/vite-app'), '../dist'));

    fs.readdirSync(spaPath, { recursive: true }).forEach((file) => {
      if (typeof file !== 'string') return;

      const filePath = path.join(spaPath, file);

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

    const distribution = new cfnDist.CloudfrontDistribution(this, 'my-cloudfront-distribution', {
      origin: [
        {
          domainName: myBucket.bucketRegionalDomainName,
          originId: myBucket.id,
          s3OriginConfig: {
            originAccessIdentity: '',
          },
        },
      ],
      enabled: true,
      isIpv6Enabled: true,
      defaultRootObject: 'index.html',
      defaultCacheBehavior: {
        allowedMethods: ['GET', 'HEAD'],
        cachedMethods: ['GET', 'HEAD'],
        targetOriginId: myBucket.id,
        viewerProtocolPolicy: 'redirect-to-https',
        forwardedValues: {
          queryString: false,
          cookies: {
            forward: 'none',
          },
        },
      },
      restrictions: {
        geoRestriction: {
          restrictionType: 'none',
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
    });

    const current = new DataAwsCallerIdentity(this, 'current', {});

    const oacPolicyDocument = new DataAwsIamPolicyDocument(this, 'oacPolicyDocument', {
      statement: [
        {
          actions: ['s3:GetObject'],
          resources: [`${myBucket.arn}/*`],
          principals: [
            {
              identifiers: ['cloudfront.amazonaws.com'],
              type: 'Service',
            },
          ],
          condition: [
            {
              test: 'StringEquals',
              variable: 'AWS:SourceArn',
              values: [`arn:aws:cloudfront::${current.accountId}:distribution/${distribution.id}}`],
            },
          ],
        },
      ],
    });

    new S3BucketPolicy(this, 's3BucketPolicy', {
      bucket: myBucket.id,
      policy: oacPolicyDocument.json,
    });

    // Output the website URL
    // new TerraformOutput(this, 'websiteUrl', {
    //   value: `https://${website.websiteEndpoint}`,
    // });

    // Output the CloudFront distribution URL
    new TerraformOutput(this, 'cloudfrontUrl', {
      value: `https://${distribution.domainName}`,
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
