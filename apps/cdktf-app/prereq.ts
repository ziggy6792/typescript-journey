import { App } from 'cdktf';
import { PreReqStack } from './stacks/PreReqStack';
import { prereqStackNames, stages } from './utils/util';

const app = new App();

stages.forEach((stage) => {
  const backendId = `cdktf-${stage}-prereq`;
  new PreReqStack(app, prereqStackNames[stage], { backendName: backendId });
});

app.synth();
