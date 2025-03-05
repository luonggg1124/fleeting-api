FROM base AS builder

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

WORKDIR /app/services/mail


RUN pnpm tsc

EXPOSE 4004    

CMD ["node","dist/index.js"]
