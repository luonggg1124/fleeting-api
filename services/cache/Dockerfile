FROM node:23 AS builder
    
WORKDIR /app

COPY . .
RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

RUN pnpm install

RUN pnpm tsc

EXPOSE 50051    

CMD ["node","dist/index.js"]
