
FROM node:lts

ENV DEBIAN_FRONTEND=noninteractive
ENV PROD=1

WORKDIR /app

# Enhance caching
ADD setup.sh /setup.sh
RUN /setup.sh

## Add real app --> moved to volune
# ADD . /app

ENTRYPOINT [ "node", "--import", "/app/node_modules/tsx/dist/esm/index.mjs", "--harmony-temporal", "/app/src/main.ts" ]
