FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install deps at root (workspaces resolve)
RUN npm install --workspaces --include-workspace-root

# Build shared then backend
RUN cd packages/shared && npx tsc
RUN cd packages/backend && npx nest build

FROM node:20-alpine
WORKDIR /app

# Copy built backend + its deps
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./

# Copy entire node_modules from root (workspaces symlinks)
COPY --from=builder /app/node_modules ./node_modules

# Copy shared dist for @chat/shared resolution
COPY --from=builder /app/packages/shared/dist ./node_modules/@chat/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@chat/shared/

EXPOSE 3001
CMD ["node", "dist/main.js"]
