#!/bin/bash

# Build the NestJS application locally
echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

# Build the Docker image
echo "Building the Docker image..."
docker build -t your-image-name .

echo "Build and Dockerize process completed."