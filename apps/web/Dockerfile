FROM oven/bun:1 AS base
WORKDIR /app

# Copy root files
COPY package.json bun.lock turbo.json ./

# Copy all source files
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN bun install --frozen-lockfile

# Build Web
WORKDIR /app/apps/web
RUN bun run build

# Release stage
FROM oven/bun:1 AS release
WORKDIR /app

# Copy built artifacts
COPY --from=base /app/apps/web/.output ./

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Start server
CMD ["bun", "server/index.mjs"]
