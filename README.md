# Open CoWork

A desktop AI coding assistant for non-technical users, built with Electron + React.

## Features

- Chat interface with AI (Claude, GPT-4o, Gemini via OpenRouter)
- Tool execution (file read/write, directory listing, shell commands)
- TODO tracking panel
- Skills marketplace (skillregistry.io integration)
- Multi-tab conversations
- Dark/light theme support
- Encrypted API key storage

## Tech Stack

- **Framework**: Electron + electron-vite
- **UI**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand
- **AI**: Vercel AI SDK + OpenRouter provider
- **Database**: SQLite via Prisma
- **Security**: Electron safeStorage for API key encryption

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Build

```bash
# Build for production
pnpm build

# Package for distribution
pnpm run build
```

## Project Structure

```
open-cowork/
├── prisma/              # Database schema
├── src/
│   ├── main/            # Electron main process
│   │   ├── index.ts     # Entry point
│   │   ├── database.ts  # Prisma setup
│   │   └── ipc/         # IPC handlers
│   ├── preload/         # Preload script
│   └── renderer/        # React app
│       ├── components/  # UI components
│       ├── hooks/       # React hooks
│       ├── stores/      # Zustand stores
│       └── services/    # AI services
└── resources/           # App resources
```

## Configuration

1. On first launch, enter your OpenRouter API key
2. Get an API key from [openrouter.ai/keys](https://openrouter.ai/keys)
3. Optionally enable analytics to help improve the app

## License

MIT
