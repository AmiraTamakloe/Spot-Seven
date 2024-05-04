FROM node:lts-slim as development

WORKDIR  /app/server
RUN apt-get update && apt-get install -y procps

FROM node:lts-slim as builder

RUN mkdir -p /app/server /app/common

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./

RUN npm ci

COPY common ../common
COPY server ../server

RUN npm run build

FROM node:lts-slim as production

WORKDIR /app

COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/out .

VOLUME [ "/app/uploads" ]
EXPOSE 3000

CMD ["node", "/app/server/app/index.js"]
