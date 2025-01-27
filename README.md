# intabyu.audio

A Web Application for practicing interview questions through audio recording and feedback.

## Features

- Record and playback audio responses to interview questions
- Organize questions by categories
- Text-to-speech question reading
- Speech-to-text transcription of answers
- Offline support
- Local storage of questions and recordings

## Setup

1. Clone the repository:
```bash
git clone https://github.com/futuressobright/intabyu.audio.git
cd intabyu.audio
```

2. Install dependencies:
```bash
npm install
```

3. START the React (client) application
```bash
% cd intabyu.audio [ % cdaud ]
% npm run dev
```

3. Start the Express server
% cd intabyu.audio/server
% nodemon server.js   # Runs on port 3002

## Project Structure

```
intabyu.audio/
├── src/
│   ├── components/    # Reusable UI components
│   ├── services/      # Core functionality
│   ├── utils/         # Helper functions
│   ├── App.js
│   └── index.js
```

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical details about the project structure and design decisions.
