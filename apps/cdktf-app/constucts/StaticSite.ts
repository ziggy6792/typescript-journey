/* eslint-disable max-classes-per-file */
import { Construct } from 'constructs';
import { s3Bucket, cloudfrontDistribution as cfnDist, cloudfrontOriginAccessControl as cfnOAC } from '@cdktf/provider-aws';
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import { getUniqueId } from '../utils/util';
import { S3DirDeploy } from './S3DirDeploy';

interface StaticSiteProps {
  path: string;
  bucketName?: string;
  ignoreFiles?: string[];
}

export class StaticSite extends Construct {
  public readonly url: string;

  public readonly bucket: s3Bucket.S3Bucket;

  constructor(scope: Construct, id: string, { path, bucketName, ignoreFiles }: StaticSiteProps) {
    super(scope, id);

    const s3DirDeploy = new S3DirDeploy(this, 's3-dir-deploy', {
      path,
      bucketName,
      ignoreFiles,
    });

    this.bucket = s3DirDeploy.bucket;

    const originAccessControl = new cfnOAC.CloudfrontOriginAccessControl(this, 'oac', {
      name: getUniqueId(this, 'oac'),
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
