# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Start app: `npm start`
- Run on Android: `npm run android` 
- Run on iOS: `npm run ios`
- Run on web: `npm run web`
- Run single test: `npx jest path/to/test-file.tsx`

## Code Style Guidelines
- **Imports**: Group imports by source (React, react-native, local components, styles)
- **Formatting**: 2-space indentation, single quotes for strings
- **Components**: Function components with hooks, explicit prop types
- **Types**: Use TypeScript for type safety, Props interface for component props
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Theme Support**: Use ThemedText/ThemedView components for dark mode support
- **Error Handling**: Try/catch blocks for async operations
- **Folder Structure**: Components in /components, screens in /src/screens
- **Context API**: Used for global state management (QuizContext)