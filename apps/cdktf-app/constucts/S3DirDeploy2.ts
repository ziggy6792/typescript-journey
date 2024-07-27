import { Construct } from 'constructs';
import { Fn, TerraformIterator } from 'cdktf';
import { s3Bucket, s3Object } from '@cdktf/provider-aws';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { getUniqueId } from '../utils/util';

interface S3DirDeployProps {
  path: string;
  bucketName?: string;
}

// Alternative implementation of S3DirDeploy using forech fileList
export class S3DirDeploy2 extends Construct {
  public readonly bucket: s3Bucket.S3Bucket;

  constructor(scope: Construct, id: string, { path: appFiles, bucketName: _bucketName }: S3DirDeployProps) {
    super(scope, id);

    const bucketName = _bucketName ?? getUniqueId(this, 'bucket');

    this.bucket = new s3Bucket.S3Bucket(this, 's3-bucket', {
      bucket: bucketName,
    });

    const fileMimeTypesLooup: Record<string, string> = {};

    fs.readdirSync(appFiles, { recursive: true }).forEach((file) => {
      if (typeof file !== 'string') return;
      const filePath = path.join(appFiles, file);
      if (fs.statSync(filePath).isDirectory()) return;
      fileMimeTypesLooup[filePath] = mime.lookup(filePath) || 'application/octet-stream';
    });

    const fileList = TerraformIterator.fromList(Fn.fileset(appFiles, '**/*'));
    new s3Object.S3Object(this, 'index', {
      forEach: fileList,
      bucket: this.bucket.id,
      key: fileList.value,
      source: `${appFiles}/${fileList.value}`,
      etag: Fn.filemd5(`${appFiles}/${fileList.value}`),
      // contentType: Fn.lookup(mime.types, Fn.element(Fn.split('.', Fn.lower(fileList.value)), 1), 'application/octet-stream'),
      contentType: Fn.lookup(fileMimeTypesLooup, `${appFiles}/${fileList.value}`),
      lifecycle: {
        preventDestroy: false,
      },
    });
  }
}
