# Stage 1: Build
FROM arm32v7/node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build
RUN ls

# Stage 2: Production
FROM arm32v7/node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN cat package.json
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/src/main"]