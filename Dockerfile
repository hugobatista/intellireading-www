# Use the official Nginx image as the base image
FROM nginx:mainline

# Links Docker image with repository
LABEL org.opencontainers.image.source=https://github.com/hugobatista/intellireading-www


# Create a new user 'wwwuser' for running Nginx processes and ensure the user has a home directory
# The '-r' option creates a system user, and '-m' ensures a home directory is created for the user
RUN useradd -r -m wwwuser && \
    # Change ownership of the Nginx web root directory to 'wwwuser' to allow file operations
    chown -R wwwuser:wwwuser /usr/share/nginx/html && \
    # Change ownership of the cache directory to 'wwwuser' so Nginx can write cache files
    chown -R wwwuser:wwwuser /var/cache/nginx/ && \
    # Change ownership of the log directory to 'wwwuser' to enable logging
    chown -R wwwuser:wwwuser /var/log/nginx/ && \
    # Create an empty file for Nginx's PID and change its ownership to 'wwwuser'
    # This is necessary because Nginx, by default, tries to write its PID to /var/run/nginx.pid
    touch /var/run/nginx.pid && \
    chown -R wwwuser:wwwuser /var/run/nginx.pid

# Copy custom nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy the content of the local src directory (containing your website files)
# to the document root of Nginx in the container
COPY ./src/. /usr/share/nginx/html

# Switch to the 'wwwuser' for running the Nginx server
# This enhances security by avoiding running the server as root
USER wwwuser

# HEALTHCHECK instruction checks the container health by accessing the root URL
# and expects a successful HTTP response. The health check is configured with 
# specific intervals, timeouts, start periods, and retry limits.
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
CMD curl --fail "http://localhost:8080/" || exit 1
