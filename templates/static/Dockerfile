FROM nginx:alpine

# Remove default config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy your configuration to the Nginx config directory
COPY nginx.conf /etc/nginx/conf.d/

# Copy the build folder to the default static files directory
COPY build/ /usr/share/nginx/html/

EXPOSE 80