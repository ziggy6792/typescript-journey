/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-dynamic-require */
import { Construct } from 'constructs';
import { S3Backend, TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import * as path from 'path';
import * as fs from 'fs';
import { Stage, prereqStackNames } from '../utils/util';

export interface AwsBaseStackProps {
  stage: Stage;
}

export class AwsBaseStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    protected readonly props: AwsBaseStackProps
  ) {
    super(scope, id);

    new provider.AwsProvider(this, 'aws-provider', {
      region: 'ap-southeast-1',
    });

    const prereqStateFile = path.join(process.env.INIT_CWD!, `./terraform.${prereqStackNames[props.stage]}.tfstate`);
    const prereqState = JSON.parse(fs.readFileSync(prereqStateFile, 'utf-8'));

    // Only one backend is supported by Terraform
    // S3 Backend - https://www.terraform.io/docs/backends/types/s3.html
    new S3Backend(this, {
      bucket: prereqState.outputs.bucket.value,
      region: 'ap-southeast-1',
      key: id,
    });
  }

  getStage(): string {
    return this.props.stage;
  }
}
