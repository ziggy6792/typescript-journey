FROM node:18.4.0 AS builder

ARG TARGET_APP

WORKDIR /asset

# .dockerignore filters out node_modules and other unneeded files
COPY ["package.json","yarn.lock",".yarnrc.yml","./"]
COPY .yarn ./.yarn
COPY packages ./packages
COPY apps ./apps

# Init yarn
RUN corepack enable

# Intall production dependencies for package being deployed
RUN yarn workspaces focus $(node -p "require('./"${TARGET_APP}"/package.json').name") --production

# Copy the dist folder and package.json from the package being deployed to root
RUN cp -r ./${TARGET_APP}/dist .
RUN cp ./${TARGET_APP}/package.json .
# Remove package at original location as it is no longer needed
RUN rm -r ./${TARGET_APP}

# Stage 2: Create zip file
FROM alpine:latest as zipper

RUN apk update && apk add zip

# Copy built assets from the builder stage
COPY --from=builder /asset /asset

# Create zip file
RUN cd /asset && zip -r /build.zip .

# Decompress zip file
# Doing this to remove symlinks
# Decompressing the zip file will create a new "flat" directory with no symlinkss
RUN mkdir /clean_build && unzip /build.zip -d /clean_build

# Remove the /packages and /appps directory
RUN rm -rf /clean_build/packages
RUN rm -rf /clean_build/apps

# Recompress the contents into a new zip file
RUN cd /clean_build && zip -r /clean_build.zip .

FROM scratch

# Copy the zip file from the builder stage to the final image
COPY --from=zipper /clean_build.zip /build.zip