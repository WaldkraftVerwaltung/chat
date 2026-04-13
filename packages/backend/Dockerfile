FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace root files
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

# Install all dependencies
RUN cd packages/shared && npm install
RUN cd packages/backend && npm install

# Copy source
COPY packages/shared/ packages/shared/
COPY packages/backend/ packages/backend/

# Build shared first, then backend
RUN cd packages/shared && npx tsc
RUN cd packages/backend && npx nest build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@chat/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@chat/shared/
COPY --from=builder /app/packages/backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
