# Architecture Overview

## Core Technologies
- React for UI components
- IndexedDB for local data storage
- Web Audio API for recording/playback
- Web Speech API for text-to-speech and transcription
- Service Workers for offline functionality

## Data Flow
1. All data is stored locally in IndexedDB
2. Audio recordings are stored as blobs
3. Questions and categories are stored as JSON
4. Components communicate through React state and props

## Key Components

### AudioRecorder
Handles microphone access and recording functionality
- Uses MediaRecorder API
- Implements 90-second time limit
- Saves recordings to IndexedDB

### AudioPlayer
Manages playback of recorded answers
- Custom controls
- Progress tracking
- Error handling

### QuestionManager
Handles question organization and storage
- Category management
- Question CRUD operations
- Answer history

### StorageService
Manages all IndexedDB operations
- Handles data persistence
- Manages storage quotas
- Error recovery

## Progressive Web App Features
- Offline functionality
- Installation capability
- Push notifications (future)
- Background sync (future)

## Future Considerations
- Cloud sync
- Multi-user support
- AI analysis integration
- Analytics
