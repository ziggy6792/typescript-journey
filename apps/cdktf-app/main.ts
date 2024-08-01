import { App } from 'cdktf';
// import { STSClient, GetCallerIdentityCommand } from 'aws-sdk';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { FrontendStack } from './stacks/FrontendStack';
import { BackendStack } from './stacks/BackendStack';
import { PreReqStack } from './stacks/PreReqStack';

const client = new STSClient({});

// const client = new STSClient({});

const main = async () => {
  const command = new GetCallerIdentityCommand({});
  const stsResponse = await client.send(command);

  const stages = ['dev'];

  const app = new App();

  stages.forEach((stage) => {
    const backendId = ['cdktf-aws-demo-bucket', stage, stsResponse.Account].join('-');
    new PreReqStack(app, `cdktf-prereq-${stage}`, { backendId, stage });
    const backendStack = new BackendStack(app, `cdktf-backend-${stage}`, { stage, backendBucket: backendId });
    new FrontendStack(app, `cdktf-frontend-${stage}`, { stage, backendBucket: backendId, apiUrl: backendStack.apiUrl });
  });

  app.synth();
};

main();
