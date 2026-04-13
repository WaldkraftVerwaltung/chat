FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci
COPY packages/shared/ packages/shared/
COPY packages/frontend/ packages/frontend/
RUN npx turbo run build --filter=@chat/frontend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/node_modules ./node_modules
COPY --from=builder /app/packages/frontend/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
