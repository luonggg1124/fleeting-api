FROM node:23.7.0 AS builder

WORKDIR /app

COPY . .


RUN npm install -g pnpm@10.2.1

RUN pnpm install 

RUN pnpm build

EXPOSE 4002    

CMD ["node","dist/index.js"]
