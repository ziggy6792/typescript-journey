import { App } from 'cdktf';
import { BackendStack } from './stacks/BackendStack';
import { stages } from './utils/util';
import { FrontendStack } from './stacks/FrontendStack';

const app = new App();

stages.forEach((stage) => {
  const backendStack = new BackendStack(app, `cdktf-${stage}-backend`, { stage });

  new FrontendStack(app, `cdktf-${stage}-frontend`, { stage, apiUrl: backendStack.apiUrl });
});

app.synth();
