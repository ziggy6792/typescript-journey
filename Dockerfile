FROM node:18.4.0

ARG PACKAGE_NAME

WORKDIR /asset

# .dockerignore filters out node_modules and other unneeded files
COPY ["package.json","yarn.lock",".yarnrc.yml","./"]
COPY .yarn ./.yarn
COPY node_modules ./node_modules
COPY apps ./apps
COPY packages ./packages

# Init yarn
RUN corepack enable

# Intall production dependencies for package being deployed
RUN yarn workspaces focus ${PACKAGE_NAME} --production