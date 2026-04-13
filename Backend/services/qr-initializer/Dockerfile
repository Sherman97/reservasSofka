# ============================================================
# QR Initializer - Lightweight Alpine image for QR generation
# Executes qr-init.sh script to generate QR codes for all spaces
# ============================================================

FROM docker.io/library/alpine:3.19

# Install wget for HTTP requests
RUN apk add --no-cache wget

# Copy initialization script
COPY qr-init.sh /scripts/qr-init.sh

# Make script executable
RUN chmod +x /scripts/qr-init.sh

# Run the initialization script
ENTRYPOINT ["/scripts/qr-init.sh"]
