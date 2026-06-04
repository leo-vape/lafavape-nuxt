FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NUXT_IGNORE_LOCK=1
RUN npm run build

FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/package-lock.json /app/
RUN npm ci --production
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
