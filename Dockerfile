# Use Debian-based Node.js image as the base for building
FROM node:22-slim AS build

# Set the working directory
WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max-old-space-size=4096"
# This environment variable is used to skip the postinstall script during the build stage
# See the package.json postinstall script for details
ENV SKIP_POSTINSTALL=1 

# Install dependencies, SQLite, and native module build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    libsqlite3-dev \
    build-essential \
    python3 \
    python3-dev \
    make \
    g++ \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for native module compilation
ENV PYTHON=/usr/bin/python3
ENV CXX=g++
ENV CC=gcc

# Set build environment variables to skip problematic modules during build
ENV NODE_ENV=production
ENV QWIK_BUILD=1

# Install pnpm globally
RUN npm install -g pnpm

# Verify installation
RUN pnpm --version

# Copy package.json and lock file
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN pnpm install --no-frozen-lockfile 

# Copy the rest of the source code
COPY ./ ./

# Install node-gyp globally for native module compilation
RUN npm install -g node-gyp

# Rebuild native modules for the container architecture
RUN pnpm rebuild

# Specifically handle LZ4 native module issues with verbose output
RUN echo "=== Attempting LZ4 native module compilation ===" \
    && rm -rf node_modules/.pnpm/lz4@*/node_modules/lz4/build || true \
    && (pnpm rebuild lz4 --verbose || echo "LZ4 rebuild failed, application will handle gracefully") \
    && echo "=== Native module compilation completed ==="

# Build the project
RUN pnpm build

# Use a Debian-based Node.js image for production
FROM node:22-slim AS production

# Set the working directory
WORKDIR /usr/src/app

# Copy the built application from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/server ./server
COPY --from=build /usr/src/app/dist ./dist

ENV PLAYWRIGHT_BROWSERS_PATH=/home/node/ms-playwright

# COPY --from=build /usr/src/app/.env ./
RUN npm exec playwright install-deps \
    && npm exec playwright install chromium --only-shell

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "node", "server/entry.express" ]
