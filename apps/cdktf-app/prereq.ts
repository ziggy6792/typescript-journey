import { App } from 'cdktf';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { PreReqStack } from './stacks/PreReqStack';
import { prereqStackNames, stages } from './utils/util';

const client = new STSClient({});

const main = async () => {
  const command = new GetCallerIdentityCommand({});
  const stsResponse = await client.send(command);

  const app = new App();

  stages.forEach((stage) => {
    const backendBucket = ['cdktf-aws-demo', stage, stsResponse.Account].join('-');
    const dynamodbTable = ['cdktf-aws-demo', stage].join('-');
    new PreReqStack(app, prereqStackNames[stage], { bucket: backendBucket, dynamodbTable });
  });

  app.synth();
};

main();
