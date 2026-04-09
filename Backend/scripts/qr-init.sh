#!/bin/sh
# ============================================================
# QR Code Initialization Script
# Waits for locations-service to be ready and generates QR codes
# for all existing spaces in the database
# ============================================================

set -e

# Configuration
LOCATIONS_SERVICE_URL="${LOCATIONS_SERVICE_URL:-http://locations-service:3004}"
HEALTH_ENDPOINT="${LOCATIONS_SERVICE_URL}/health"
REGENERATE_ENDPOINT="${LOCATIONS_SERVICE_URL}/locations/spaces/regenerate-qr"
MAX_RETRIES="${MAX_RETRIES:-30}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"

echo "========================================"
echo " QR Code Initialization"
echo "========================================"
echo "Locations Service URL: ${LOCATIONS_SERVICE_URL}"
echo "Max Retries: ${MAX_RETRIES}"
echo "Retry Interval: ${RETRY_INTERVAL}s"
echo ""

# Wait for locations-service to be healthy
echo "[1/2] Waiting for locations-service to be ready..."
retry_count=0

while [ $retry_count -lt $MAX_RETRIES ]; do
    retry_count=$((retry_count + 1))
    echo "  Attempt ${retry_count}/${MAX_RETRIES}: Checking health endpoint..."
    
    if wget --spider --timeout=3 --tries=1 "${HEALTH_ENDPOINT}" 2>/dev/null; then
        echo "  ✓ Locations service is healthy!"
        break
    fi
    
    if [ $retry_count -eq $MAX_RETRIES ]; then
        echo "  ✗ ERROR: Locations service did not become healthy after ${MAX_RETRIES} attempts"
        exit 1
    fi
    
    echo "  Service not ready yet. Waiting ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

echo ""
echo "[2/2] Generating QR codes for all spaces..."

response=$(wget -qO- --post-data='' --header='Content-Type: application/json' "${REGENERATE_ENDPOINT}" 2>&1) || {
    echo "  ✗ ERROR: Failed to call regenerate QR endpoint"
    echo "  Response: ${response}"
    exit 1
}

echo "  ✓ QR code generation completed!"
echo "  Response: ${response}"
echo ""
echo "========================================"
echo " QR Initialization Complete"
echo "========================================"
