FROM node:23.7.0 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY tsconfig.base.json ./

RUN npm install -g pnpm@10.2.1

COPY package.json ./

RUN pnpm install

# RUN pnpm install --frozen-lockfile

COPY services/cache ./services/cache

WORKDIR /app/services/cache

RUN pnpm tsc

FROM node:23.7.0 as RUNTIME

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/services/cache/dist ./dist

EXPOSE 50051    

CMD ["node","dist/index.js"]
