/* eslint-disable max-classes-per-file */
import { Construct } from 'constructs';
import { AssetType, TerraformAsset, TerraformOutput } from 'cdktf';
import { s3Bucket, s3Object, cloudfrontDistribution as cfnDist } from '@cdktf/provider-aws';
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { DataAwsCallerIdentity } from '@cdktf/provider-aws/lib/data-aws-caller-identity';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 8 });

interface StaticSiteProps {
  path: string;
  bucketName?: string;
}

export class StaticSite extends Construct {
  public readonly url: string;

  constructor(scope: Construct, id: string, { path: spaPath, bucketName = `${id}-bucket` }: StaticSiteProps) {
    super(scope, id);

    const bucket = new s3Bucket.S3Bucket(this, 's3-bucket', {
      bucket: bucketName,
    });

    fs.readdirSync(spaPath, { recursive: true }).forEach((file) => {
      if (typeof file !== 'string') return;

      const filePath = path.join(spaPath, file);

      if (fs.statSync(filePath).isDirectory()) return;

      const asset = new TerraformAsset(this, `asset-${file}`, {
        path: filePath,
        type: AssetType.FILE,
      });

      new s3Object.S3Object(this, `object-${file}`, {
        bucket: bucket.bucket,
        key: file,
        source: asset.path,
        contentType: mime.lookup(file).toString(),
      });
    });

    const distribution = new cfnDist.CloudfrontDistribution(this, 'cloudfront-distribution', {
      origin: [
        {
          domainName: bucket.bucketRegionalDomainName,
          originId: bucket.id,
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
        targetOriginId: bucket.id,
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
          resources: [`${bucket.arn}/*`],
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
      bucket: bucket.id,
      policy: oacPolicyDocument.json,
    });

    this.url = `https://${distribution.domainName}`;
  }
}
