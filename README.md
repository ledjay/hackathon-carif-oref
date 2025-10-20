# 🎩 Carif-Oref × Réfugiés.info Hackathon

A Next.js chat interface that connects to an n8n workflow backend for the Carif-Oref / Réfugiés.info hackathon project.

## 📋 Project Purpose

This project provides a modern, user-friendly chat interface for interacting with an AI assistant powered by n8n workflows. The application enables users to have conversational interactions with AI models through a clean, responsive web interface while leveraging n8n's powerful workflow automation capabilities on the backend.

**Key Features:**
- Real-time streaming chat interface
- Session management for conversation continuity
- Integration with n8n workflow engine
- Responsive design with Tailwind CSS
- Built with Next.js 15 and React 19

## 🛠️ Technology Stack

### Frontend
- **[Next.js 15.5.5](https://nextjs.org)** - React framework with App Router and Turbopack
- **[React 19.1.0](https://react.dev)** - UI library
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework
- **[Vercel AI SDK](https://sdk.vercel.ai)** - Streaming AI responses with `useChat` hook
- **TypeScript 5** - Type safety

### Backend Integration
- **[n8n](https://n8n.io)** - Workflow automation platform (external service)
- **Edge Runtime** - Serverless API routes for optimal performance

### Utilities
- **clsx** - Conditional className construction
- **tailwind-merge** - Merge Tailwind CSS classes without conflicts

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ installed
- **pnpm** package manager (recommended) or npm/yarn
- An **n8n instance** with a chat workflow endpoint

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-carif-oref
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   N8N_CHAT_STREAM_URL=https://your-n8n-instance.com/webhook/chat
   ```

   Replace the URL with your actual n8n webhook endpoint that handles chat streaming.

### Running the Development Server

Start the development server with Turbopack:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
hackathon-carif-oref/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # Chat API endpoint (Edge runtime)
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Chat interface component
│   └── lib/
│       └── utils/
│           └── className.ts      # Utility for className merging
├── package.json
└── README.md
```

## 🔧 How It Works

### Chat Flow

1. **User Input** → User types a message in the textarea
2. **Session Management** → A unique session ID is generated on mount and persisted
3. **API Request** → Message is sent to `/api/chat` with session ID in headers
4. **n8n Integration** → API route forwards the request to the configured n8n webhook
5. **Stream Processing** → n8n returns a streaming response with JSON chunks
6. **Real-time Display** → Messages are streamed and displayed in real-time using Vercel AI SDK

### API Route (`/api/chat`)

The Edge API route:
- Receives messages from the frontend
- Extracts session ID from headers
- Forwards requests to n8n webhook with `sessionId`, `action`, and `chatInput`
- Parses n8n's streaming JSON format (`type: 'item'` chunks)
- Converts to Vercel AI SDK data stream format
- Returns streaming response to the client

### n8n Webhook Format

The n8n endpoint should return streaming JSON in this format:
```json
{"type":"item","content":"chunk of text"}
{"type":"item","content":"another chunk"}
```

## 🎨 UI Features

- **Flex-based Layout** - Full-height viewport with scrollable message area
- **Message Bubbles** - Distinct styling for user (blue) and assistant (white) messages
- **Loading States** - Visual feedback during AI response generation
- **Responsive Design** - Works on desktop and mobile devices
- **Session Display** - Shows current session ID in header

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `N8N_CHAT_STREAM_URL` | n8n webhook endpoint for chat streaming | Yes |

## 📝 Development Notes

- The project uses **Turbopack** for faster builds and hot reloading
- API routes run on **Edge Runtime** for optimal performance
- Session IDs are generated client-side using `crypto.randomUUID()`
- The chat interface maintains scroll position and auto-scrolls to new messages

