# Overview

ResearchLab is a gamified research protocol management application that combines laboratory workflow tools with engaging game mechanics. The platform allows researchers to create, manage, and execute research protocols through an interactive interface featuring timers, checklists, notes, and measurements. The application incorporates a quest system with a companion character to motivate users and track their progress through various research tasks.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based frontend with TypeScript, built on Vite for fast development and optimized builds. The UI is constructed with Radix UI components and styled using Tailwind CSS for consistent, accessible design patterns. The frontend incorporates 3D graphics capabilities through React Three Fiber for rendering an interactive companion character and potentially other 3D elements.

### State Management
The application employs Zustand with the subscribeWithSelector middleware for predictable state management across multiple domains:
- **Game State**: Manages overall game phases (ready, playing, ended)
- **Protocol State**: Handles protocol creation, editing, and widget management
- **Research State**: Controls timers and checklists functionality
- **Quest State**: Manages the gamification system including quests, scoring, and companion interactions
- **Audio State**: Controls sound effects and background music

### Component Architecture
The UI follows a modular component structure with reusable UI components built on Radix UI primitives. Key components include:
- **GameUI**: Main interface with tabbed navigation
- **ProtocolBuilder**: Drag-and-drop interface for creating research protocols
- **TimerManager**: Real-time timer controls and displays
- **ChecklistManager**: Interactive task management
- **QuestSystem**: Gamification progress tracking
- **CompanionCharacter**: 3D animated character for user engagement

## Backend Architecture
The backend uses Express.js as the web server with TypeScript for type safety. The server implements a simple route registration system and includes development-time Vite integration for hot module replacement.

### Data Storage
The application currently uses an in-memory storage implementation (`MemStorage`) that can be easily swapped for a database-backed solution. The storage interface defines CRUD operations for user management, with the schema prepared for PostgreSQL integration.

### API Design
The server is structured to handle REST API routes under the `/api` prefix, with comprehensive error handling and request/response logging for development debugging.

## Data Storage Solutions
The application uses Drizzle ORM configured for PostgreSQL, with database schemas defined in shared TypeScript files. The current implementation includes:
- User management schema with username/password authentication
- Database migrations managed through Drizzle Kit
- Connection to Neon Database via serverless PostgreSQL adapter

### Persistence Strategy
Client-side data persistence uses localStorage for:
- Research protocols and widgets
- Quest progress and player statistics
- Companion character state and interactions
- User preferences and settings

## Authentication and Authorization
The basic user schema is implemented with username/password fields, prepared for future authentication system integration. The current implementation includes placeholder CRUD operations for user management.

# External Dependencies

## Database and ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and schema management tools

## UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Consistent icon library
- **Class Variance Authority**: Type-safe CSS class management

## 3D Graphics and Animation
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers and abstractions for React Three Fiber
- **React Three Postprocessing**: Post-processing effects for enhanced visuals

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundler for production builds

## State Management and Utilities
- **Zustand**: Lightweight state management solution
- **TanStack React Query**: Data fetching and caching
- **React Hook Form**: Performant form handling
- **Date-fns**: Date manipulation utilities
- **Zod**: Runtime type validation and schema parsing

## Drag and Drop
- **React DND**: Drag and drop functionality for protocol widget management
- **React DND HTML5 Backend**: HTML5 drag and drop backend
- **React DND Touch Backend**: Touch-friendly drag and drop for mobile devices

## Audio and Media
The application includes audio management capabilities for background music and sound effects, with support for various audio formats (MP3, OGG, WAV) and 3D model files (GLTF, GLB).

# Journalling Feature (AI Agent Guidance)

## Purpose
Implement a journalling function that logs daily lab activities in a text format. Each journal entry should:
- Be time and date stamped as a header for each day
- Log all protocols run, including detailed steps taken
- Be easily accessible and navigable in the UI
- Support exporting the journal as plain text for use on other platforms

## Implementation Guidance
- Store journal entries in a structured format (e.g., per-day text files or a database table with date keys)
- When a protocol is run, append its name and all steps taken to the current day's journal entry
- Ensure each day's entry starts with a clear timestamp header (e.g., `## 2025-09-19`)
- Provide a UI component for users to view, search, and navigate journal entries by date
- Add an export function to download journal entries as `.txt` files
- Use existing state management (Zustand) to trigger journal updates when protocols are executed
- Example journal entry:
	```
	## 2025-09-19
	Protocol: DNA Extraction
	Steps:
		1. Prepare reagents
		2. Add sample to tube
		3. Centrifuge for 5 min
		...
	Protocol: PCR Amplification
	Steps:
		1. Mix primers
		2. Run thermal cycler
		...
	```

## Conventions
- Journal entries should be plain text, with clear section headers and step lists
- Exported files must preserve formatting for easy copy-paste
- Keep journalling logic modular for future extension (e.g., rich text, cloud sync)