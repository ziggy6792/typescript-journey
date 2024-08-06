import { Construct } from 'constructs';
import { AssetType, Fn, TerraformAsset } from 'cdktf';
import { s3Bucket, s3Object } from '@cdktf/provider-aws';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { getUniqueId } from '../utils/util';

interface S3DirDeployProps {
  path: string;
  bucketName?: string;
  ignoreFiles?: string[];
}

export class S3DirDeploy extends Construct {
  public readonly bucket: s3Bucket.S3Bucket;

  public readonly objects: s3Object.S3Object[] = [];

  constructor(scope: Construct, id: string, { path: dirPath, bucketName: _bucketName, ignoreFiles }: S3DirDeployProps) {
    super(scope, id);

    const bucketName = _bucketName ?? getUniqueId(this, 'bucket');

    this.bucket = new s3Bucket.S3Bucket(this, 's3-bucket', {
      bucket: bucketName,
    });

    fs.readdirSync(dirPath, { recursive: true }).forEach((file) => {
      if (typeof file !== 'string') return;

      const filePath = path.join(dirPath, file);

      if (fs.statSync(filePath).isDirectory()) return;

      if (ignoreFiles?.includes(file)) return;

      this.objects.push(
        new s3Object.S3Object(this, `s3-object-${file}`, {
          bucket: this.bucket.bucket,
          key: file,
          source: filePath,
          etag: Fn.filemd5(filePath),
          contentType: mime.lookup(file).toString(),
          forceDestroy: true,
        })
      );
    });
  }
}
