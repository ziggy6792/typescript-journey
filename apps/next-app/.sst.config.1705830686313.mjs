import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../sst-app/.sst/outputs.json
var require_outputs = __commonJS({
  "../sst-app/.sst/outputs.json"(exports, module) {
    module.exports = {
      "dev-tsj-AuthStack": {},
      "dev-tsj-NextApp": {
        url: "https://d152uaov7gfeml.cloudfront.net"
      }
    };
  }
});

// ../sst-app/sst.config.ts
import { commonConfig } from "@ts-journey/common";

// ../sst-app/stacks/AuthStack.ts
import { Cognito } from "sst/constructs";

// ../sst-app/utils/utility.ts
var getConstructName = /* @__PURE__ */ __name((name, app) => [app.name, app.stage, name].join("-"), "getConstructName");

// ../sst-app/stacks/AuthStack.ts
var getStackOutputs = /* @__PURE__ */ __name(() => {
  try {
    return require_outputs();
  } catch (error) {
    console.warn("No previous deployment found, pleease deploy again after this deployment is complete");
    return {};
  }
}, "getStackOutputs");
var stackOutputs = getStackOutputs();
function AuthStack({ stack, app }) {
  const callbackUrls = ["http://localhost:3000/api/auth/callback/cognito"];
  const productionCloudfrontUrl = stackOutputs[`${app.stage}-${app.name}-NextApp`]?.url;
  if (productionCloudfrontUrl) {
    callbackUrls.push(`${productionCloudfrontUrl}/api/auth/callback/cognito`);
  }
  const auth = new Cognito(stack, "Auth", {
    login: ["email"],
    cdk: {
      userPoolClient: {
        generateSecret: true,
        oAuth: {
          callbackUrls,
          logoutUrls: callbackUrls
        }
      }
    }
  });
  auth.cdk.userPool.addDomain("CognitoDomain", {
    cognitoDomain: {
      domainPrefix: getConstructName("domain", app)
    }
  });
  return {
    auth
  };
}
__name(AuthStack, "AuthStack");

// ../sst-app/stacks/NextApp.ts
import path from "path";
import { Bucket, NextjsSite, use } from "sst/constructs";
function NextApp({ stack, app }) {
  const { auth } = use(AuthStack);
  const { userPoolClientId, userPoolClientSecret } = auth.cdk.userPoolClient;
  const bucket = new Bucket(stack, "file-uploads", { name: app.logicalPrefixedName("file-uploads") });
  const site = new NextjsSite(stack, "next-app", {
    path: path.join(__require.resolve("@ts-journey/next-app"), ".."),
    buildCommand: "yarn open:next:build",
    bind: [bucket],
    environment: {
      COGNITO_CLIENT_ID: userPoolClientId,
      COGNITO_CLIENT_SECRET: userPoolClientSecret.toString(),
      COGNITO_ISSUER: `https://cognito-idp.ap-southeast-1.amazonaws.com/${auth.userPoolId}`
    }
  });
  stack.addOutputs({
    url: site.url
  });
}
__name(NextApp, "NextApp");

// ../sst-app/sst.config.ts
var sst_config_default = {
  config(_input) {
    return {
      name: commonConfig.PROJECT_NAME,
      region: "ap-southeast-1",
      stage: "dev"
    };
  },
  stacks(app) {
    app.stack(AuthStack).stack(NextApp);
  }
};
export {
  sst_config_default as default
};
