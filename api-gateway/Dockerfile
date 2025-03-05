FROM node:23.7.0 AS builder


# RUN pnpm install --frozen-lockfile

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

WORKDIR /app/api-gateway



RUN pnpm tsc

EXPOSE 4000

CMD ["node","dist/index.js"]
