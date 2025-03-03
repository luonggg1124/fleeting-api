FROM node:23.7.0 AS builder



WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
RUN npm install -g pnpm@10.2.1
COPY package.json ./


RUN pnpm install

# RUN pnpm install --frozen-lockfile

COPY services/notification ./services/notification

WORKDIR /app/services/notification
RUN pnpm build
FROM node:23.7.0 as RUNTIME
RUN pnpm tsc
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/services/notification/dist ./dist

EXPOSE 4002

CMD ["node","dist/index.js"]
