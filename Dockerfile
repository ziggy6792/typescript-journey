FROM node:18.4.0

ARG TARGET_APP

WORKDIR /asset

# .dockerignore filters out node_modules and other unneeded files
COPY ["package.json","yarn.lock",".yarnrc.yml","./"]
COPY .yarn ./.yarn
COPY ${TARGET_APP} ./${TARGET_APP}
COPY packages ./packages  

# Init yarn
RUN corepack enable

# Intall production dependencies for package being deployed
RUN yarn workspaces focus $(node -p "require('./"${TARGET_APP}"/package.json').name") --production

FROM scratch
COPY --from=0 /asset .