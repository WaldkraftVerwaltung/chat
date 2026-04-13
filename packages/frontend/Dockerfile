FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install deps at root
RUN npm install --workspaces --include-workspace-root

# Build shared then frontend
RUN cd packages/shared && npx tsc

ARG NEXT_PUBLIC_API_URL=http://91.107.233.103:3010
ARG NEXT_PUBLIC_WS_URL=http://91.107.233.103:3010
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd packages/frontend && npx next build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/package.json ./
COPY --from=builder /app/packages/frontend/next.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules
ENV PORT=3000
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
