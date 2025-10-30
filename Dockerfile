# Multi-stage Dockerfile for building a Vite + React app and serving with nginx
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package metadata and lockfile first to leverage Docker layer caching for dependencies
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies) because Vite build needs them
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production image: lightweight nginx serving the built files
FROM nginx:stable-alpine AS runner

LABEL org.opencontainers.image.source="https://github.com/HaAnhKhoa-sos/DatingWeb"

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config with one that supports SPA routing (fallback to index.html)
RUN rm /etc/nginx/conf.d/default.conf \
	&& cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
	listen 80;
	server_name _;
	root /usr/share/nginx/html;
	index index.html index.htm;

	# Try to serve files directly, fallback to index.html for client-side routing
	location / {
		try_files $uri $uri/ /index.html;
	}

	# Short-circuit for static assets with long cache lifetime
	location ~* \.(?:css|js|bmp|gif|jpe?g|png|svg|ico|ttf|woff2?)$ {
		try_files $uri =404;
		access_log off;
		add_header Cache-Control "public, max-age=31536000, immutable";
	}

	# Prevent caching of html/json-like responses
	location ~* \.(?:manifest|appcache|html|xml|json)$ {
		add_header Cache-Control "no-cache, no-store, must-revalidate";
	}
}
EOF

EXPOSE 80
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]

