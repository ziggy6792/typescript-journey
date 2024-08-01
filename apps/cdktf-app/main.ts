import { App } from 'cdktf';
import { FrontendStack } from './stacks/FrontendStack';
import { BackendStack } from './stacks/BackendStack';

const stages = ['dev', 'prod'];

const app = new App();

stages.forEach((stage) => {
  new FrontendStack(app, `cdktf-frontend-${stage}`, { stage, backendBucket: `cdktf-aws-demo-bucket-${stage}` });
  new BackendStack(app, `cdktf-backend-${stage}`, { stage, backendBucket: `cdktf-aws-demo-bucket-${stage}` });
});

app.synth();
