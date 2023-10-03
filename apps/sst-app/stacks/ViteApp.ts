import path from 'path';
import { StackContext, StaticSite, use } from 'sst/constructs';

export function ViteApp({ stack }: StackContext) {
  const site = new StaticSite(stack, 'vite-app', {
    path: path.join(require.resolve('@ts-journey/vite-app'), '..'),
    buildCommand: 'yarn build',
    buildOutput: 'dist',
    // Pass in our environment variables
    environment: {},
  });

  // Show the url in the output
  stack.addOutputs({
    SiteUrl: site.url,
  });
}
