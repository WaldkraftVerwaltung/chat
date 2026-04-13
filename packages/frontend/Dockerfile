FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace root files
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/

# Install dependencies
RUN cd packages/shared && npm install
RUN cd packages/frontend && npm install

# Copy source
COPY packages/shared/ packages/shared/
COPY packages/frontend/ packages/frontend/

# Build shared, then frontend
RUN cd packages/shared && npx tsc

# Set env vars for build
ARG NEXT_PUBLIC_API_URL=http://91.107.233.103:3010
ARG NEXT_PUBLIC_WS_URL=http://91.107.233.103:3010
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN cd packages/frontend && npx next build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/node_modules ./node_modules
COPY --from=builder /app/packages/frontend/package.json ./
COPY --from=builder /app/packages/frontend/next.config.ts ./
EXPOSE 3000
CMD ["npm", "start"]
