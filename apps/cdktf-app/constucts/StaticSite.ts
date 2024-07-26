/* eslint-disable max-classes-per-file */
import { Construct } from 'constructs';
import { AssetType, TerraformAsset, TerraformStack } from 'cdktf';
import { s3Bucket, s3Object, cloudfrontDistribution as cfnDist, cloudfrontOriginAccessControl as cfnOAC } from '@cdktf/provider-aws';
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { DataAwsCallerIdentity } from '@cdktf/provider-aws/lib/data-aws-caller-identity';
import * as crypto from 'crypto';

// Function to create an MD5 hash
const hashId = (input: string) => crypto.createHash('md5').update(input).digest('hex').slice(-8);

const getUniqueId = (scope: Construct, id: string) => `${TerraformStack.of(scope)}-${scope.node.id}-${id}-${hashId(scope.node.id)}`.toLowerCase();

interface StaticSiteProps {
  path: string;
  bucketName?: string;
}

export class StaticSite extends Construct {
  public readonly url: string;

  public readonly bucket: s3Bucket.S3Bucket;

  constructor(scope: Construct, id: string, { path: spaPath, bucketName: _bucketName }: StaticSiteProps) {
    super(scope, id);

    const bucketName = _bucketName ?? getUniqueId(this, 'bucket');

    this.bucket = new s3Bucket.S3Bucket(this, 's3-bucket', {
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
        bucket: this.bucket.bucket,
        key: file,
        source: asset.path,
        contentType: mime.lookup(file).toString(),
      });
    });

    const originAccessControl = new cfnOAC.CloudfrontOriginAccessControl(this, 'site-oac', {
      name: 'site-oac',
      description: 'OAC for accessing S3 bucket',
      originAccessControlOriginType: 's3',
      signingBehavior: 'always',
      signingProtocol: 'sigv4',
    });

    const distribution = new cfnDist.CloudfrontDistribution(this, 'cloudfront-distribution', {
      origin: [
        {
          domainName: this.bucket.bucketRegionalDomainName,
          originId: this.bucket.id,
          s3OriginConfig: {
            originAccessIdentity: '',
          },
          originAccessControlId: originAccessControl.id,
        },
      ],
      enabled: true,
      isIpv6Enabled: true,
      defaultRootObject: 'index.html',
      defaultCacheBehavior: {
        allowedMethods: ['GET', 'HEAD'],
        cachedMethods: ['GET', 'HEAD'],
        targetOriginId: this.bucket.id,
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

    const oacPolicyDocument = new DataAwsIamPolicyDocument(this, 'oac-policy-dsocument', {
      statement: [
        {
          actions: ['s3:GetObject'],
          resources: [`${this.bucket.arn}/*`],
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
              values: [distribution.arn],
            },
          ],
        },
      ],
    });

    new S3BucketPolicy(this, 's3-bucket-policy', {
      bucket: this.bucket.id,
      policy: oacPolicyDocument.json,
    });

    this.url = `https://${distribution.domainName}`;
  }
}
