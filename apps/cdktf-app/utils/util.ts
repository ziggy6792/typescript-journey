/* eslint-disable max-classes-per-file */
import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import * as crypto from 'crypto';

// Function to create an MD5 hash
const hashId = (input: string) => crypto.createHash('md5').update(input).digest('hex').slice(-8);

export const getUniqueId = (scope: Construct, id: string) => `${TerraformStack.of(scope)}-${scope.node.id}-${id}-${hashId(scope.node.id)}`.toLowerCase();
