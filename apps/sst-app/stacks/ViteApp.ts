import path from 'path';
import { StackContext, StaticSite } from 'sst/constructs';

export function ViteApp({ stack }: StackContext) {
  const site = new StaticSite(stack, 'vite-app', {
    path: path.join(require.resolve('@ts-journey/vite-app'), '..'),
    buildOutput: 'dist',
    buildCommand: 'yarn build',
    environment: {},
  });

  // Show the url in the output
  stack.addOutputs({
    SiteUrl: site.url,
  });
}
