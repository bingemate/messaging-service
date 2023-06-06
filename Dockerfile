FROM amd64/node:18-alpine as node-builder
WORKDIR /app
COPY --chown=node:node . .
RUN apk --no-cache --virtual build-dependencies add python3 make
RUN npm install
RUN npm run build

FROM amd64/node:18-alpine
USER node
WORKDIR /app
COPY --from=node-builder --chown=node:node /app/package*.json ./
COPY --from=node-builder --chown=node:node /app/node_modules/ ./node_modules/
COPY --from=node-builder --chown=node:node /app/dist/ ./dist/

EXPOSE 3000

ENV \
  DB_HOST=127.0.0.1 \
  DB_NAME=postgres \
  DB_PASSWORD=postgres \
  DB_PORT=5432 \
  DB_USER=postgres \
  SERVER_PORT=3000


CMD ["node", "dist/main.js"]
