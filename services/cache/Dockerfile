FROM base AS builder
    
WORKDIR /app/services/cache



RUN pnpm tsc

EXPOSE 50051    

CMD ["node","dist/index.js"]
