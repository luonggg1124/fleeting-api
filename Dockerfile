FROM node:23.7.0

WORKDIR /app

RUN npm install -g pnpm@10.2.1

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN ls -al tsconfig.base.json

RUN pnpm tsc

