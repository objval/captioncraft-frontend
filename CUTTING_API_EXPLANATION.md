# Video Cutting API Documentation

## Overview

The Video Cutting API allows you to automatically or manually cut videos by removing silence periods or selecting specific segments. This feature works with both original uploaded videos and videos that have already been burned with captions.

## Key Features

- **Automatic Silence Detection**: Analyzes transcript data to identify and remove silence periods
- **Manual Cutting**: Specify exact segments to keep in the final video
- **Dual Source Support**: Cut either original videos or caption-burned videos
- **Smart Offsets**: Configurable padding around speech segments for smooth transitions
- **Non-Destructive**: Original videos are preserved; cuts create new versions
- **Credit System**: 1 credit per cutting operation

## Authentication

All endpoints require JWT authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Analyze Silence

**Endpoint**: `POST /v1/videos/:id/analyze-silence`

**Description**: Analyzes a video's transcript to detect silence periods and preview potential cuts without consuming credits.

**Request Body**:
```json
{
  "config": {
    "silenceThreshold": 0.5,      // Minimum gap duration to consider as silence (seconds)
    "offsetBefore": 0.3,          // Padding before speech starts (seconds)
    "offsetAfter": 0.3,           // Padding after speech ends (seconds)
    "minSegmentLength": 1.0       // Minimum duration for a segment to be kept (seconds)
  }
}
```

**Response**:
```json
{
  "silenceGaps": [
    {
      "start": 1.18,
      "end": 1.78,
      "duration": 0.6
    }
  ],
  "cutSegments": [
    {
      "start": 0.0,
      "end": 1.28,
      "duration": 1.28,
      "words": 3,
      "reason": "Speech segment before 0.60s gap"
    }
  ],
  "summary": {
    "originalDuration": 24.84,
    "cutDuration": 21.98,
    "removedDuration": 2.86,
    "removedPercentage": 11.5,
    "segmentCount": 6
  }
}
```

**Status Codes**:
- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Transcript data not found
- `404 Not Found`: Video not found
- `401 Unauthorized`: Invalid or missing authentication

### 2. Cut Video

**Endpoint**: `POST /v1/videos/:id/cut`

**Description**: Creates a cut version of the video. Consumes 1 credit.

**Request Body**:

For automatic cutting:
```json
{
  "sourceType": "original",  // or "burned"
  "mode": "automatic",
  "config": {
    "silenceThreshold": 0.5,
    "offsetBefore": 0.3,
    "offsetAfter": 0.3,
    "minSegmentLength": 1.0
  }
}
```

For manual cutting:
```json
{
  "sourceType": "burned",
  "mode": "manual",
  "manualSegments": [
    {
      "start": 0.0,
      "end": 5.5,
      "duration": 5.5,
      "words": 15,
      "reason": "Introduction"
    },
    {
      "start": 10.2,
      "end": 15.8,
      "duration": 5.6,
      "words": 20,
      "reason": "Main content"
    }
  ]
}
```

**Response**:
```json
{
  "message": "Video cutting initiated for original video in automatic mode",
  "jobId": "cut_abc123",
  "videoId": "550e8400-e29b-41d4-a716-446655440000",
  "sourceType": "original",
  "creditsDeducted": 1
}
```

**Status Codes**:
- `200 OK`: Cutting job created successfully
- `400 Bad Request`: Invalid request (missing segments for manual mode, source video not found)
- `402 Payment Required`: Insufficient credits
- `404 Not Found`: Video not found
- `401 Unauthorized`: Invalid or missing authentication

### 3. Get Video Cuts

**Endpoint**: `GET /v1/videos/:id/cuts`

**Description**: Retrieves all cut versions created for a video.

**Response**:
```json
{
  "cuts": [
    {
      "id": "cut_123",
      "originalVideoId": "550e8400-e29b-41d4-a716-446655440000",
      "sourceType": "original",
      "cutCloudinaryId": "caption-craft/videos/550e8400_cut_original",
      "cutSegments": [...],
      "cuttingConfig": {
        "silenceThreshold": 0.5,
        "offsetBefore": 0.3,
        "offsetAfter": 0.3,
        "minSegmentLength": 1.0
      },
      "originalDuration": 24.84,
      "cutDuration": 21.98,
      "removedDuration": 2.86,
      "removedPercentage": 11.5,
      "createdAt": "2025-01-23T10:30:00Z",
      "cutVideoUrl": "https://res.cloudinary.com/..."
    }
  ],
  "message": "Found 1 cut version(s) for this video"
}
```

**Status Codes**:
- `200 OK`: Cuts retrieved successfully
- `404 Not Found`: Video not found
- `401 Unauthorized`: Invalid or missing authentication

### 4. Delete Video Cut

**Endpoint**: `DELETE /v1/videos/:id/cuts/:cutId`

**Description**: Deletes a specific cut version. This removes the cut from both the database and cloud storage.

**Response**:
```json
{
  "message": "Video cut deleted successfully"
}
```

**Status Codes**:
- `200 OK`: Cut deleted successfully
- `404 Not Found`: Video or cut not found
- `401 Unauthorized`: Invalid or missing authentication

## Configuration Parameters

### Silence Detection Config

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `silenceThreshold` | number | 0.5 | Minimum gap duration in seconds to consider as silence |
| `offsetBefore` | number | 0.3 | Seconds of padding to add before speech segments |
| `offsetAfter` | number | 0.3 | Seconds of padding to add after speech segments |
| `minSegmentLength` | number | 1.0 | Minimum duration in seconds for a segment to be kept |

### Best Practices for Configuration

1. **For fast-paced content**: Use lower silence threshold (0.3-0.4s)
2. **For presentations/lectures**: Use higher threshold (0.8-1.0s)
3. **For smooth transitions**: Increase offsets (0.5s)
4. **For maximum compression**: Decrease offsets (0.1s)

## Workflow Examples

### Example 1: Automatic Silence Removal

```bash
# Step 1: Analyze silence
curl -X POST https://api.captioncraft.app/v1/videos/550e8400/analyze-silence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "silenceThreshold": 0.5
    }
  }'

# Step 2: Cut video based on analysis
curl -X POST https://api.captioncraft.app/v1/videos/550e8400/cut \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "original",
    "mode": "automatic",
    "config": {
      "silenceThreshold": 0.5
    }
  }'

# Step 3: Check cut status (optional)
curl -X GET https://api.captioncraft.app/v1/videos/550e8400 \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Get cut video URL
curl -X GET https://api.captioncraft.app/v1/videos/550e8400/cuts \
  -H "Authorization: Bearer $TOKEN"
```

### Example 2: Manual Segment Selection

```bash
# Cut specific segments from a burned video
curl -X POST https://api.captioncraft.app/v1/videos/550e8400/cut \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "burned",
    "mode": "manual",
    "manualSegments": [
      {
        "start": 5.0,
        "end": 30.0,
        "duration": 25.0,
        "words": 100,
        "reason": "Main content"
      },
      {
        "start": 45.0,
        "end": 60.0,
        "duration": 15.0,
        "words": 50,
        "reason": "Conclusion"
      }
    ]
  }'
```

## Video Processing Flow

```
Original Video → Transcription → Cut Original → Burn Captions
                                       ↓
                               Cut Original Video

Original Video → Transcription → Burn Captions → Cut Burned
                                       ↓
                               Burned Video → Cut Burned Video
```

## Important Notes

1. **Transcript Required**: Videos must be transcribed before they can be cut (automatic mode uses word-level timing from transcripts)

2. **Source Video Availability**:
   - For `sourceType: "original"`: Original video must exist
   - For `sourceType: "burned"`: Burned video must exist

3. **Credit Consumption**: Credits are deducted when the cutting job is created, not when analysis is performed

4. **Processing Time**: Cutting time depends on video length and number of segments. Typical processing: 
   - < 5 min video: 30-60 seconds
   - 5-30 min video: 1-3 minutes
   - > 30 min video: 3-10 minutes

5. **Quality Preservation**: Video cutting uses stream copy (no re-encoding), preserving original quality

6. **Multiple Cuts**: You can create multiple cut versions of the same video with different configurations

## Error Handling

Common error responses:

```json
{
  "statusCode": 400,
  "message": "Transcript data not found. Please ensure the video has been transcribed.",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 402,
  "message": "Insufficient credits. You need at least 1 credits to perform this action.",
  "error": "Payment Required"
}
```

## Rate Limiting

Video cutting endpoints are subject to the global rate limit:
- 10 requests per minute per user
- 429 Too Many Requests response when exceeded

## Support

For issues or questions about the Video Cutting API:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Email: support@captioncraft.app