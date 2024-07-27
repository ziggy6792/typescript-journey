import { Construct } from 'constructs';
import { s3Bucket, s3BucketWebsiteConfiguration, s3BucketPublicAccessBlock } from '@cdktf/provider-aws';
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import { S3DirDeploy } from './S3DirDeploy';

interface SimpleStaticSiteProps {
  path: string;
  bucketName?: string;
}

export class SimpleStaticSite extends Construct {
  public readonly url: string;

  public readonly bucket: s3Bucket.S3Bucket;

  constructor(scope: Construct, id: string, { path, bucketName }: SimpleStaticSiteProps) {
    super(scope, id);

    const s3DirDeploy = new S3DirDeploy(this, 's3-dir-deploy', {
      path,
      bucketName,
    });

    this.bucket = s3DirDeploy.bucket;

    const publicAccessBlock = new s3BucketPublicAccessBlock.S3BucketPublicAccessBlock(this, 's3-bucket-public-access-block', {
      bucket: this.bucket.id,
      blockPublicAcls: false,
      blockPublicPolicy: false,
      ignorePublicAcls: false,
      restrictPublicBuckets: false,
    });

    const website = new s3BucketWebsiteConfiguration.S3BucketWebsiteConfiguration(this, 's3-bucket-website', {
      bucket: this.bucket.bucket,
      indexDocument: {
        suffix: 'index.html',
      },
      errorDocument: {
        key: '404.html',
      },
    });

    const oacPolicyDocument = new DataAwsIamPolicyDocument(this, 'oac-policy-document', {
      statement: [
        {
          actions: ['s3:GetObject'],
          resources: [`${this.bucket.arn}/*`],
          principals: [
            {
              type: 'AWS',
              identifiers: ['*'], // Allows public access
            },
          ],
        },
      ],
    });

    new S3BucketPolicy(this, 's3-bucket-policy', {
      bucket: this.bucket.id,
      policy: oacPolicyDocument.json,
      dependsOn: [publicAccessBlock],
    });

    this.url = `http://${website.websiteEndpoint}`;
  }
}
