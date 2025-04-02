# Vif

Vif is a natural language todo list you wish you had. A modern, minimalist application built with Next.js that leverages AI to understand voice commands and natural language input.

## Features

- **Voice Commands**: Add, edit, complete, or delete tasks using your voice
- **Natural Language Processing**: Type commands like "clear completed" or "sort by alphabetical"
- **Date Organization**: Organize todos by date with an intuitive calendar view
- **Emoji Support**: Add emojis to your tasks for visual categorization
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technologies

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **UI Components**: Shadcn UI - A collection of accessible and customizable components 
- **AI Services**: 
  - Groq LLama model for natural language understanding
  - ElevenLabs for speech-to-text conversion
- **State Management**: React Hooks, LocalStorage for persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Create a `.env.local` file with your API keys:
   ```
   GROQ_API_KEY=your_groq_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

The application is organized into modular components:

- `components/todo/`: UI components for the todo application
- `components/ui/`: Shadcn UI components
- `hooks/`: Custom React hooks for speech recognition and state management
- `types/`: TypeScript type definitions
- `lib/utils/`: Utility functions for todo operations
- `app/actions.ts`: Server actions for AI processing

## Voice Commands

- "Add [task]" - Creates a new todo
- "Complete [task]" - Marks a todo as completed
- "Delete [task]" - Removes a todo
- "Edit [task] to [new task]" - Modifies an existing todo
- "Sort by [newest/oldest/alphabetical/completed]" - Changes sort order
- "Clear [all/completed/incomplete]" - Removes todos based on criteria

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Zaid Mukaddam
