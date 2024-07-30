/* eslint-disable max-classes-per-file */
import { Construct } from 'constructs';
import { S3Backend, TerraformStack } from 'cdktf';
import * as crypto from 'crypto';
import { provider } from '@cdktf/provider-aws';

// Function to create an MD5 hash
const hashId = (input: string) => crypto.createHash('md5').update(input).digest('hex').slice(-8);

// Unique ID formed from the stack name, the construct ID, a descriptive id parameter, and the hash of parent construct ID, to lower case
// E.g : cdktf-s3-dir-deploy-bucket-9c349b26
// This ensures uniqueness of IDs across constructs
export const getUniqueId = (scope: Construct, id: string) =>
  `${TerraformStack.of(scope)}-${scope.node.id}-${id}-${hashId(scope.node.scope?.node?.id ?? scope.node.id)}`.toLowerCase();

export const getConstructName = (scope: Construct, id: string) => `${TerraformStack.of(scope)}-${id}`.toLowerCase();
