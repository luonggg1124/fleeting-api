FROM base AS builder

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

WORKDIR /app/services/user


RUN pnpm tsc

EXPOSE 4001    

CMD ["node","dist/index.js"]
