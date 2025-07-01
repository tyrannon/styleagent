# StyleAgent

A local-first AI style assistant that runs on macOS, designed to complement the StyleMuse mobile app with desktop capabilities and local AI processing.

## What It Does

StyleAgent analyzes your wardrobe and provides personalized outfit suggestions using local AI models. It maintains your clothing database locally, processes style queries privately, and learns from your preferences without sending data to external servers.

## Architecture

```
styleagent/
├── ui/           # Desktop interface components
├── agent/        # AI logic and outfit generation
├── data/         # Local wardrobe storage (JSON/SQLite)
├── llm/          # Local model integration (Ollama/MLC)
├── scripts/      # Utilities and import tools
└── config/       # User preferences and settings
```

## Core Features

- **Wardrobe Management**: Visual catalog of your clothing items
- **AI Outfit Generation**: Local LLM-powered style suggestions
- **Voice Interaction**: Whisper speech-to-text + TTS responses
- **Preference Learning**: Adapts to your style choices over time
- **Privacy-First**: All processing happens locally

## Quick Start

```bash
# Install dependencies
npm install

# Set up local AI model
ollama pull llama3

# Start development server
npm run dev
```

## Requirements

- macOS 12+
- Node.js 18+
- Ollama (for local AI) or MLC runtime
- 8GB+ RAM recommended for local models

## Development

See `CLAUDE_TASKS.md` for current development priorities and implementation tasks.

## Privacy

Your wardrobe data and style preferences never leave your device. All AI processing happens locally using open-source models.