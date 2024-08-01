import { App } from 'cdktf';
// import { STSClient, GetCallerIdentityCommand } from 'aws-sdk';
import { FrontendStack } from './stacks/FrontendStack';
import { BackendStack } from './stacks/BackendStack';
import { PreReqStack } from './stacks/PreReqStack';

// const client = new STSClient({});

const stages = ['dev'];

const app = new App();

stages.forEach((stage) => {
  const preReqStack = new PreReqStack(app, `cdktf-prereq-${stage}`, { bucketNamePrefix: `cdktf-aws-demo-bucket`, stage });
  new BackendStack(app, `cdktf-backend-${stage}`, { stage, backendBucket: preReqStack.bucketName });
  new FrontendStack(app, `cdktf-frontend-${stage}`, { stage, backendBucket: preReqStack.bucketName });
});

app.synth();
