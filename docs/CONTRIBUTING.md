# Contributing to intabyu.audio

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Code Structure

### Components
- Each component should be in its own directory
- Include a test file with each component
- Keep components focused and single-purpose

Example:
```
components/AudioRecorder/
├── AudioRecorder.jsx
├── AudioRecorder.test.js
└── index.js
```

### Naming Conventions
- Components: PascalCase (e.g., AudioPlayer)
- Functions: camelCase (e.g., handleRecording)
- Files: Same as their default export
- CSS classes: lowercase with hyphens

### Code Style
- Use functional components
- Prefer const over let
- Use async/await over .then()
- Document complex logic with comments

### Commits
- Use clear, descriptive commit messages
- One feature/fix per commit
- Reference issue numbers when applicable

### Testing
- Write tests for new features
- Run tests before committing
- Keep coverage above 80%

### Pull Requests
1. Create feature branch from main
2. Make your changes
3. Write/update tests
4. Submit PR with description of changes
5. Reference related issues

## Best Practices
- Don't store sensitive data
- Handle errors gracefully
- Test across different browsers
- Consider accessibility
- Document API changes
