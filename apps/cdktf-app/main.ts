import { App } from 'cdktf';
import { FrontendStack } from './stacks/FrontendStack';
import { BackendStack } from './stacks/BackendStack';
// import { S3DirDeploy2 } from './constucts/S3DirDeploy2';

const app = new App();
// new FrontendStack(app, 'cdktf-frontend');
new BackendStack(app, 'cdktf-backend');
app.synth();
