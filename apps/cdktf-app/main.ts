import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { container, image, provider } from '@cdktf/provider-docker';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Add Docker provider
    new provider.DockerProvider(this, 'docker', {
      // Not sure why default doesnt work, got this from docker context ls
      host: 'unix:///Users/simon.verhoeven/.docker/run/docker.sock',
    });

    // define resources here

    const myImage = new image.Image(this, 'image', {
      name: 'nginx:latest',
      keepLocally: false,
    });

    const myContainer = new container.Container(this, 'nginxContainer', {
      image: myImage.name,
      name: 'demo',
      ports: [
        {
          internal: 80,
          external: 8000,
        },
      ],
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf');
app.synth();
