
FROM node:23 AS base

# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add -g typescript

WORKDIR /app

# ---------------------------
# Install dependencies (using pnpm workspace)
# ---------------------------
FROM base AS dependencies

WORKDIR /app

# Copy workspace config and install dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---------------------------
# Build all packages & services
# ---------------------------
FROM dependencies AS build

COPY . . 

RUN pnpm --filter api-gateway build 
RUN  pnpm --filter user-service build
RUN  pnpm --filter cache-service build
RUN  pnpm --filter mail-service build
RUN  pnpm --filter notification-service build
# ---------------------------
# Production Image (Service-specific)
# ---------------------------
FROM base AS service

WORKDIR /app

# Copy only necessary files from build
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/tsconfig.base.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

# ---------------------------
# API Gateway
# ---------------------------
FROM service AS api-gateway
WORKDIR /app/services/api-gateway
COPY --from=build /app/services/api-gateway .
RUN pnpm install --prod
EXPOSE 4000
CMD ["node", "dist/index.js"]

# ---------------------------
# User Service
# ---------------------------
FROM service AS user-service
WORKDIR /app/services/user-service
COPY --from=build /app/services/user-service .
RUN pnpm install --prod
EXPOSE 4001
CMD ["node", "dist/index.js"]

# ---------------------------
# Mail Service
# ---------------------------
FROM service AS mail-service
WORKDIR /app/services/mail-service
COPY --from=build /app/services/mail-service .
RUN pnpm install --prod
EXPOSE 4004
CMD ["node", "dist/index.js"]

# ---------------------------
# Cache Service
# ---------------------------
FROM service AS cache-service
WORKDIR /app/services/cache-service
COPY --from=build /app/services/cache-service .
RUN pnpm install --prod
EXPOSE 50051
CMD ["node", "dist/index.js"]
