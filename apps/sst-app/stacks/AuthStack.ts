/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Cognito, StackContext } from 'sst/constructs';
import { getConstructName } from '../utils/utility';

// Workaround to get stack output for previous sst deplyoment, if it exists
const getStackOutputs = () => {
  try {
    return require('../.sst/outputs.json');
  } catch (error) {
    console.warn('No previous deployment found, pleease deploy again after this deployment is complete');
    return {};
  }
};

const stackOutputs = getStackOutputs();

export function AuthStack({ stack, app }: StackContext) {
  const callbackUrls = ['http://localhost:3000/api/auth/callback/cognito'];

  const productionCloudfrontUrl = stackOutputs[`${app.stage}-${app.name}-NextApp`]?.url;

  if (productionCloudfrontUrl) {
    callbackUrls.push(`${productionCloudfrontUrl}/api/auth/callback/cognito`);
  }

  const auth = new Cognito(stack, 'Auth', {
    login: ['email'],
    cdk: {
      userPoolClient: {
        generateSecret: true,
        oAuth: {
          callbackUrls,
          logoutUrls: callbackUrls,
        },
      },
    },
  });

  auth.cdk.userPool.addDomain('CognitoDomain', {
    cognitoDomain: {
      domainPrefix: getConstructName('domain', app),
    },
  });

  return {
    auth,
  };
}
