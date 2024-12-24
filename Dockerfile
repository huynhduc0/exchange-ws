# Stage 1: Build the NestJS application
FROM arm64v8/node:16 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM --platform=linux/arm64 nginx:alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3003
CMD ["nginx", "-g", "daemon off;"]