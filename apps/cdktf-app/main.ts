import { App } from 'cdktf';
import { FrontendStack } from './stacks/FrontendStack';
import { BackendStack } from './stacks/BackendStack';

const app = new App();
new FrontendStack(app, 'cdktf-frontend');
new BackendStack(app, 'cdktf-backend');
app.synth();
