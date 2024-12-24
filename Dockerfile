# Stage 1: Build the NestJS application
FROM arm32v7/node:16 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run the NestJS application
FROM arm32v7/node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
EXPOSE 3000 3003
CMD ["node", "dist/main.js"]