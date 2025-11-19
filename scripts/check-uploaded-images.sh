#!/bin/bash

# Script to check uploaded images from IoT devices
# Usage: ./check-uploaded-images.sh [deviceId]

SERVER_URL="http://103.197.188.247:5000"
DEVICE_ID="${1:-TEST-DEVICE-001}"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         RelaWand Image Upload Verification                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 1. Check webhook health
echo "1️⃣  Checking webhook service health..."
HEALTH=$(curl -s "$SERVER_URL/api/webhook/health")
if echo "$HEALTH" | grep -q "Webhook service is running"; then
    echo "   ✅ Webhook service is running"
    echo "   📁 Upload directory: $(echo $HEALTH | grep -oP '(?<="uploadDir":")[^"]*')"
    echo "   🔗 Base URL: $(echo $HEALTH | grep -oP '(?<="baseUrl":")[^"]*')"
else
    echo "   ❌ Webhook service is not responding"
    exit 1
fi
echo ""

# 2. Check images for device
echo "2️⃣  Checking images for device: $DEVICE_ID"
IMAGES=$(curl -s "$SERVER_URL/api/webhook/images/$DEVICE_ID")

TOTAL=$(echo "$IMAGES" | grep -oP '(?<="total":)\d+')
echo "   📊 Total images: $TOTAL"

if [ "$TOTAL" -gt 0 ]; then
    echo ""
    echo "   Recent uploads:"
    echo "$IMAGES" | python3 -m json.tool 2>/dev/null | grep -A 3 "fileName\|imageUrl\|captureTime" | head -20
else
    echo "   ℹ️  No images found for this device"
fi
echo ""

# 3. Check file system
echo "3️⃣  Checking file system (requires SSH access)..."
if command -v ssh &> /dev/null; then
    FILE_COUNT=$(ssh izcy-engine "ls -1 /var/www/relawand/uploads/ 2>/dev/null | wc -l" 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "   📂 Files in upload directory: $FILE_COUNT"
        echo ""
        echo "   Recent files:"
        ssh izcy-engine "ls -lht /var/www/relawand/uploads/ | head -6" 2>/dev/null
    else
        echo "   ⚠️  Cannot access remote server (SSH not configured)"
    fi
else
    echo "   ⚠️  SSH not available"
fi
echo ""

# 4. Test file accessibility
echo "4️⃣  Testing file accessibility..."
if [ "$TOTAL" -gt 0 ]; then
    # Get first image URL
    IMAGE_URL=$(echo "$IMAGES" | grep -oP '(?<="imageUrl":")[^"]*' | head -1)
    if [ ! -z "$IMAGE_URL" ]; then
        echo "   🔗 Testing URL: $IMAGE_URL"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   ✅ Image is publicly accessible (HTTP $HTTP_CODE)"
        else
            echo "   ❌ Image not accessible (HTTP $HTTP_CODE)"
        fi
    fi
else
    echo "   ℹ️  No images to test"
fi
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Verification Complete                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
