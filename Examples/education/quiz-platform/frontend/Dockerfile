# Stage 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx on port 8080
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/quiz-platform /usr/share/nginx/html

RUN echo 'server { \
  listen 8080; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
  location /health { return 200 "ok"; add_header Content-Type text/plain; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
