import { Fn } from 'cdktf';
import { lambdaFunction, iamRole, iamRolePolicyAttachment } from '@cdktf/provider-aws';
import { Construct } from 'constructs';
import { getConstructName } from '../utils/util';

interface LambdaFunctionProps {
  assetPath: string;
  functionName: string;
}

export class LambdaFunction extends Construct {
  public readonly lambdaFunction: lambdaFunction.LambdaFunction;

  constructor(scope: Construct, id: string, { assetPath, functionName }: LambdaFunctionProps) {
    super(scope, id);

    // Create IAM role for Lambda
    const lambdaRole = new iamRole.IamRole(this, 'lambda-execution-role', {
      name: getConstructName(this, `${functionName}-execution-role`),
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      }),
    });

    // Attach policy to the role
    new iamRolePolicyAttachment.IamRolePolicyAttachment(this, 'LambdaExecutionRolePolicy', {
      role: lambdaRole.name,
      policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    });

    this.lambdaFunction = new lambdaFunction.LambdaFunction(this, 'lambda-function', {
      functionName: getConstructName(this, functionName),
      handler: 'index.handler',
      runtime: 'nodejs18.x',
      role: lambdaRole.arn,
      filename: assetPath,
      sourceCodeHash: Fn.filebase64sha256(assetPath),
      timeout: 30,
    });
  }
}
