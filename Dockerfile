# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
# syntax=docker/dockerfile:1
FROM nginx:1.21.4
COPY dist/ /usr/share/nginx/html
# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf