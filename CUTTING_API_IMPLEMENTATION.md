# Video Cutting Feature Implementation

## Overview

This document describes the implementation of the video cutting feature for CaptionCraft API. The feature allows users to automatically or manually cut videos by removing silence periods or selecting specific segments.

## Implementation Components

### 1. Database Schema

**Migration File**: `migrations/add-video-cutting-fields.sql`

Added fields to `videos` table:
- `cutting_config`: JSONB configuration for automatic cutting
- `cut_segments`: JSONB array of segments kept in cut version
- `original_duration`: Original video duration in seconds
- `cut_duration`: Cut video duration in seconds
- `cut_original_cloudinary_id`: Cloudinary ID for cut original video
- `cut_burned_cloudinary_id`: Cloudinary ID for cut burned video
- `has_cut_original`: Boolean flag for original cut existence
- `has_cut_burned`: Boolean flag for burned cut existence

New `video_cuts` table for tracking cut history with RLS policies.

### 2. FFmpeg Service Enhancements

**File**: `src/shared/services/ffmpeg.service.ts`

New methods:
- `detectSilenceFromTranscript()`: Analyzes transcript for silence gaps
- `detectSilenceGaps()`: Identifies gaps between words
- `generateCutSegments()`: Creates segments with configurable offsets
- `cutVideoBySegments()`: Cuts and concatenates video segments
- `getVideoDuration()`: Gets video duration using ffprobe

New interfaces:
- `SilenceDetectionConfig`: Configuration for silence detection
- `SilenceGap`: Represents a silence period
- `CutSegment`: Represents a video segment to keep
- `CuttingSummary`: Summary of cutting operation

### 3. Cutting Processor

**File**: `src/modules/queues/cutting.processor.ts`

Handles async video cutting jobs:
1. Downloads source video from Cloudinary
2. For automatic mode: detects silence and generates segments
3. For manual mode: uses provided segments
4. Cuts video using FFmpeg
5. Uploads cut video to Cloudinary
6. Updates database records
7. Cleans up temporary files

### 4. API Endpoints

**File**: `src/modules/videos/videos.controller.ts`

New endpoints:
- `POST /v1/videos/:id/analyze-silence`: Analyze silence without cutting
- `POST /v1/videos/:id/cut`: Create cut version (1 credit)
- `GET /v1/videos/:id/cuts`: List all cut versions
- `DELETE /v1/videos/:id/cuts/:cutId`: Delete a cut version

### 5. Videos Service Methods

**File**: `src/modules/videos/videos.service.ts`

New methods:
- `analyzeSilence()`: Analyzes transcript for silence detection
- `cutVideo()`: Creates cutting job with validation
- `getVideoCuts()`: Retrieves all cuts for a video
- `deleteVideoCut()`: Removes cut from DB and Cloudinary
- Enhanced `enrichVideoWithUrls()` to include cut video URLs

### 6. DTOs and Validation

**File**: `src/modules/videos/dto/cutting.dto.ts`

Data transfer objects with validation:
- `SilenceDetectionConfigDto`: Config validation
- `CutSegmentDto`: Segment structure validation
- `AnalyzeSilenceDto`: Analysis request validation
- `CutVideoDto`: Cut request validation with modes
- Response DTOs for all endpoints

### 7. Type Definitions

**File**: `src/shared/types/index.ts`

Updated `Video` interface with new fields for cutting functionality.

## Key Features

### 1. Automatic Silence Detection
- Uses word-level timing from OpenAI Whisper transcripts
- Configurable silence threshold (default: 0.5s)
- Smart offsets for smooth transitions
- Minimum segment length to avoid micro-cuts

### 2. Manual Cutting
- Precise segment selection
- Multiple segments support
- Preserves video quality (stream copy)

### 3. Dual Source Support
- Cut original uploaded videos
- Cut videos with burned-in captions
- Separate tracking for each type

### 4. Non-Destructive
- Original videos preserved
- Multiple cut versions possible
- Full history tracking

## Configuration Options

```typescript
{
  silenceThreshold: 0.5,    // Minimum gap to consider silence (seconds)
  offsetBefore: 0.3,        // Padding before speech (seconds)
  offsetAfter: 0.3,         // Padding after speech (seconds)
  minSegmentLength: 1.0     // Minimum segment duration (seconds)
}
```

## Processing Flow

1. **User uploads video** → Transcription with word-level timing
2. **User analyzes silence** → Preview cuts without credit consumption
3. **User requests cut** → 1 credit deducted, job queued
4. **Processor cuts video** → Downloads, cuts, concatenates, uploads
5. **User downloads result** → Cut video URL available

## Security & Authorization

- JWT authentication required for all endpoints
- RLS policies ensure users can only access their own videos
- Credit guard prevents cutting without sufficient credits
- Rate limiting prevents abuse

## Performance Considerations

- Concurrent processing limited to 1 job to prevent memory issues
- Stream copy preserves quality without re-encoding
- Temporary files cleaned up after processing
- Efficient segment concatenation using FFmpeg concat

## Error Handling

- Comprehensive validation at all levels
- Graceful handling of missing transcripts
- Proper cleanup on failure
- User-friendly error messages

## Testing

The implementation includes:
- DTO validation with class-validator
- Type safety with TypeScript
- Error case handling
- Rate limit testing considerations

## Future Enhancements

Potential improvements:
1. Preview generation for cuts
2. Batch cutting multiple videos
3. Advanced silence detection algorithms
4. Integration with video editor UI
5. Real-time progress updates via WebSocket

## Usage Example

```bash
# Analyze silence
curl -X POST http://localhost:3001/v1/videos/550e8400/analyze-silence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"config": {"silenceThreshold": 0.5}}'

# Cut video automatically
curl -X POST http://localhost:3001/v1/videos/550e8400/cut \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "original",
    "mode": "automatic",
    "config": {"silenceThreshold": 0.5}
  }'
```

## Deployment Notes

1. Run database migration before deployment
2. Ensure FFmpeg is installed on servers
3. Configure adequate temp storage for video processing
4. Monitor queue performance and adjust concurrency if needed
5. Set up proper error alerting for failed jobs