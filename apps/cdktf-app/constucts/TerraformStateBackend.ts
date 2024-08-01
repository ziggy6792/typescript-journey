import { s3Bucket, s3BucketVersioning, s3BucketLifecycleConfiguration, dynamodbTable } from '@cdktf/provider-aws';
import { Construct } from 'constructs';

interface TerraformStateBackendProps {
  bucketName: string;
  dynamodbTableName: string;
}

export class TerraformStateBackend extends Construct {
  public readonly bucket: s3Bucket.S3Bucket;

  constructor(scope: Construct, id: string, { bucketName, dynamodbTableName }: TerraformStateBackendProps) {
    super(scope, id);

    this.bucket = new s3Bucket.S3Bucket(this, 'terraformStateBucket', {
      bucket: bucketName,
      acl: 'private',
    });

    new s3BucketVersioning.S3BucketVersioningA(this, 'bucketVersioning', {
      bucket: this.bucket.bucket,
      versioningConfiguration: {
        status: 'Enabled',
      },
    });

    new s3BucketLifecycleConfiguration.S3BucketLifecycleConfiguration(this, 'bucketLifecycle', {
      bucket: this.bucket.bucket,
      rule: [
        {
          id: 'expire-old-versions',
          status: 'Enabled',
          noncurrentVersionExpiration: {
            noncurrentDays: 30,
          },
        },
      ],
    });

    new dynamodbTable.DynamodbTable(this, 'terraformLockTable', {
      name: dynamodbTableName,
      billingMode: 'PAY_PER_REQUEST',
      hashKey: 'LockID',
      attribute: [
        {
          name: 'LockID',
          type: 'S',
        },
      ] as dynamodbTable.DynamodbTableAttribute[],
    });
  }
}
