import { App } from 'sst/constructs';

export const getConstructName = (name: string, app: App): string => [app.name, app.stage, name].join('-');
