FROM oven/bun:1 AS base
WORKDIR /app

# Copy root files
COPY package.json bun.lock turbo.json drizzle.config.cjs ./

# Copy all source files (respecting .dockerignore)
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN bun install --frozen-lockfile

# Build API
WORKDIR /app/apps/api
RUN bun run build

# Release stage
FROM oven/bun:1 AS release
WORKDIR /app

# Copy built artifacts
COPY --from=base /app/apps/api/.output ./

# Expose port
EXPOSE 4000

# Start server
CMD ["bun", "server/index.mjs"]

