# IoT Device Image Upload Webhook Guide

## Overview
This guide explains how IoT devices can upload images to the RelaWand backend server using the webhook API.

## Webhook Endpoint

**URL**: `http://103.197.188.247:5000/api/webhook/image`
**Method**: `POST`
**Content-Type**: `multipart/form-data`

## Request Parameters

### Required Fields
- `image` (file): The image file to upload (JPEG, PNG, GIF, etc.)
- `deviceId` (string): Unique identifier for the IoT device

### Optional Fields
- `triggeredBy` (string): Type of trigger - Options: `manual`, `alert`, `scheduled` (default: `manual`)
- `alertId` (string): Alert ID if triggered by an alert
- `userId` (string): User ID associated with the image (defaults to system default)
- `metadata` (JSON string): Additional metadata about the image
  ```json
  {
    "resolution": "1920x1080",
    "quality": 85,
    "cameraSettings": {
      "exposure": "auto",
      "iso": 400
    }
  }
  ```

## File Constraints
- **Maximum file size**: 10MB
- **Allowed formats**: All image formats (image/*)
- **Files per request**: 1 image at a time

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "deviceId": "STM32-001",
    "imageUrl": "http://103.197.188.247:5000/uploads/STM32-001_1732032000000_image.jpg",
    "fileName": "STM32-001_1732032000000_image.jpg",
    "fileSize": 524288,
    "captureTime": "2025-11-18T12:00:00.000Z",
    "triggeredBy": "alert"
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields or invalid file
```json
{
  "success": false,
  "message": "No image file provided"
}
```

**500 Internal Server Error** - Server error
```json
{
  "success": false,
  "message": "Failed to upload image",
  "error": "Error details"
}
```

## Implementation Examples

### 1. ESP32/Arduino (HTTP Client)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "http://103.197.188.247:5000/api/webhook/image";
const char* deviceId = "STM32-001";

void uploadImage(uint8_t* imageData, size_t imageSize) {
  HTTPClient http;

  // Create boundary for multipart form data
  String boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

  // Prepare multipart form data
  String bodyStart = "--" + boundary + "\r\n";
  bodyStart += "Content-Disposition: form-data; name=\"deviceId\"\r\n\r\n";
  bodyStart += String(deviceId) + "\r\n";
  bodyStart += "--" + boundary + "\r\n";
  bodyStart += "Content-Disposition: form-data; name=\"triggeredBy\"\r\n\r\n";
  bodyStart += "alert\r\n";
  bodyStart += "--" + boundary + "\r\n";
  bodyStart += "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n";
  bodyStart += "Content-Type: image/jpeg\r\n\r\n";

  String bodyEnd = "\r\n--" + boundary + "--\r\n";

  http.begin(serverUrl);
  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  // Calculate total size
  int totalSize = bodyStart.length() + imageSize + bodyEnd.length();
  http.addHeader("Content-Length", String(totalSize));

  // Send request
  WiFiClient* stream = http.getStreamPtr();
  stream->print(bodyStart);
  stream->write(imageData, imageSize);
  stream->print(bodyEnd);

  int httpResponseCode = http.POST("");

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Upload successful!");
    Serial.println("Response: " + response);
  } else {
    Serial.println("❌ Upload failed. Error: " + String(httpResponseCode));
  }

  http.end();
}
```

### 2. Python (Raspberry Pi / Linux)

```python
import requests
from datetime import datetime

WEBHOOK_URL = "http://103.197.188.247:5000/api/webhook/image"
DEVICE_ID = "STM32-001"

def upload_image(image_path, triggered_by='manual', alert_id=None):
    """Upload image to webhook endpoint"""

    try:
        # Prepare form data
        data = {
            'deviceId': DEVICE_ID,
            'triggeredBy': triggered_by
        }

        if alert_id:
            data['alertId'] = alert_id

        # Prepare files
        with open(image_path, 'rb') as image_file:
            files = {
                'image': ('capture.jpg', image_file, 'image/jpeg')
            }

            # Send POST request
            response = requests.post(WEBHOOK_URL, data=data, files=files)

            if response.status_code == 201:
                print("✅ Image uploaded successfully!")
                print(f"Response: {response.json()}")
                return response.json()
            else:
                print(f"❌ Upload failed: {response.status_code}")
                print(f"Error: {response.text}")
                return None

    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return None

# Usage example
if __name__ == "__main__":
    result = upload_image('/path/to/image.jpg', triggered_by='alert')
    if result:
        print(f"Image URL: {result['data']['imageUrl']}")
```

### 3. cURL (Testing)

```bash
# Basic upload
curl -X POST http://103.197.188.247:5000/api/webhook/image \
  -F "image=@/path/to/image.jpg" \
  -F "deviceId=STM32-001" \
  -F "triggeredBy=manual"

# Upload with metadata
curl -X POST http://103.197.188.247:5000/api/webhook/image \
  -F "image=@/path/to/image.jpg" \
  -F "deviceId=STM32-001" \
  -F "triggeredBy=alert" \
  -F 'metadata={"resolution":"1920x1080","quality":85}'
```

### 4. NodeMCU / ESP8266

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

void uploadImageToWebhook(uint8_t* imageBuffer, size_t bufferSize) {
  WiFiClient client;
  HTTPClient http;

  http.begin(client, "http://103.197.188.247:5000/api/webhook/image");

  String boundary = "----WebKitFormBoundaryABC123";
  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  String header = "--" + boundary + "\r\n";
  header += "Content-Disposition: form-data; name=\"deviceId\"\r\n\r\n";
  header += "STM32-001\r\n";
  header += "--" + boundary + "\r\n";
  header += "Content-Disposition: form-data; name=\"image\"; filename=\"esp.jpg\"\r\n";
  header += "Content-Type: image/jpeg\r\n\r\n";

  String footer = "\r\n--" + boundary + "--\r\n";

  uint32_t totalLen = header.length() + bufferSize + footer.length();

  uint8_t* buffer = (uint8_t*)malloc(totalLen);
  memcpy(buffer, header.c_str(), header.length());
  memcpy(buffer + header.length(), imageBuffer, bufferSize);
  memcpy(buffer + header.length() + bufferSize, footer.c_str(), footer.length());

  int httpCode = http.POST(buffer, totalLen);

  if (httpCode == 201) {
    Serial.println("✅ Image uploaded successfully");
  } else {
    Serial.printf("❌ Upload failed: %d\n", httpCode);
  }

  free(buffer);
  http.end();
}
```

## Additional API Endpoints

### Get Device Images
**GET** `/api/webhook/images/:deviceId`

Query parameters:
- `limit` (number): Maximum number of images to return (default: 50)
- `offset` (number): Number of images to skip (default: 0)

Example:
```bash
curl http://103.197.188.247:5000/api/webhook/images/STM32-001?limit=10&offset=0
```

### Delete Image
**DELETE** `/api/webhook/images/:id`

Example:
```bash
curl -X DELETE http://103.197.188.247:5000/api/webhook/images/507f1f77bcf86cd799439011
```

### Health Check
**GET** `/api/webhook/health`

Example:
```bash
curl http://103.197.188.247:5000/api/webhook/health
```

## File Storage

- **Production Server**: `/var/www/relawand/uploads/`
- **File naming format**: `{deviceId}_{timestamp}_{originalName}.{ext}`
- **Public access**: `http://103.197.188.247:5000/uploads/{fileName}`

## Security Considerations

1. **Authentication**: Currently open for IoT devices. Consider adding API key authentication in production.
2. **Rate Limiting**: Consider implementing rate limits to prevent abuse.
3. **File Validation**: Only image files are accepted. File type is validated server-side.
4. **Storage Cleanup**: Implement periodic cleanup of old images to manage disk space.

## Troubleshooting

### Common Issues

1. **"No image file provided"**
   - Ensure the form field name is `image`
   - Check file is properly attached to request

2. **"deviceId is required"**
   - Include deviceId in form data
   - Verify field name is exactly `deviceId`

3. **File size too large**
   - Maximum file size is 10MB
   - Consider compressing images before upload

4. **Connection timeout**
   - Check network connectivity
   - Verify server URL and port
   - Ensure firewall allows outbound connections

## Support

For issues or questions:
- Check server logs: `/var/log/relawand/`
- Monitor MQTT broker: `http://103.197.188.247:18083`
- API health check: `http://103.197.188.247:5000/api/health`
