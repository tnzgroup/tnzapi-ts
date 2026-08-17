FROM node:20-alpine

WORKDIR /src

# Build context is the repo root (see demo/docker-compose.yml) so this Dockerfile can see and
# build the tnzapi-ts SDK that demo/api depends on via file:../.. before installing demo/api's
# own dependencies (npm's file: protocol copies the SDK's dist/ into demo/api's node_modules at
# install time — the SDK must already be built when `npm install` runs here).
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm install && npm run build

COPY demo/api ./demo/api
WORKDIR /src/demo/api
RUN npm install && npm run build

EXPOSE 5080
# start:dev (nest start --watch), not `node dist/main.js` — demo/docker-compose.yml bind-mounts
# the whole repo over /src for live-editing (see its own comment), which shadows whatever this
# build step compiled into dist/ at container start. --watch recompiles into dist/ itself as soon
# as the container comes up (nest-cli.json's deleteOutDir clears whatever the bind mount brought
# in first), so this works correctly both on a fresh clone with no prior local build and after
# every live source edit — running the static dist/main.js build instead would leave the
# container broken on a fresh clone (no dist/ exists on the host yet) and stale after every edit.
CMD ["npm", "run", "start:dev"]
