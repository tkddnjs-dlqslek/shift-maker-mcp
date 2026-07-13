# shift-maker MCP server — container image
FROM node:20-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV PORT=3000
# Runtime configuration (no secrets baked in):
#   SMARTSHIFT_API_URL  — backend base URL
#   MCP_SHARED_SECRET   — shared secret for backend auth (required)
EXPOSE 3000
CMD ["node", "dist/index.js"]
