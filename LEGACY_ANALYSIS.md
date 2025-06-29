# Legacy System Architecture Analysis

## Overview
Legacy 시스템은 3D 월드 기반의 메타버스 플랫폼으로, 사용자가 가상 환경에서 캐릭터를 조작하고 월드를 편집할 수 있는 기능을 제공합니다.

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **3D Rendering**: Three.js + React Three Fiber
- **Physics Engine**: Rapier (via @react-three/rapier)
- **State Management**: Jotai (Atom-based)
- **Server State**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Styling**: CSS-in-JS with Vanilla Extract

## Application Structure

### 1. Entry Point Architecture
```
src/legacy/main.tsx
├── QueryClient Provider (React Query)
├── Jotai Provider (Global State)
├── DevTools (Development)
└── App Component
```

### 2. Routing System
The application uses React Router with three main routes:

#### Main Routes
- `/aggjack/` - Main world exploration mode
- `/aggjack/room/` - Room editing mode (requires Manager role)
- `/aggjack/auth/` - Authentication page
- `/aggjack/denied/` - Access denied page

### 3. Authentication & Authorization

#### User Roles
1. **Regular User** (role: 0) - Basic access
2. **Manager** (role: 1) - Room editing access
3. **Admin** (role: 2) - Full system access

#### Authentication Flow
```
checkApi() → Token validation → User data retrieval → Role-based routing
```

#### Protection Components
- `RequireLogin` - Requires authenticated user
- `RequireManager` - Requires Manager role or higher
- `RequireAdmin` - Requires Admin role
- `Check` - Global authentication wrapper

## Core Components Architecture

### 1. 3D World System

#### ThreeContainer
- **Purpose**: Main 3D rendering container
- **Features**:
  - Canvas setup with camera configuration
  - Physics simulation integration
  - Zoom and rotation controls
  - GaesupWorld integration
  - Performance optimization with frameloop="demand"

#### Ground System
- **Ground Component**: Base invisible plane for physics collision
- **UpdateGround**: Enhanced ground for room editing mode

#### Player System
- **Character Controller**: 3D character with movement controls
- **Features**:
  - Walk/Run speeds: 15/20 units respectively
  - Jump mechanics with speech balloon feedback
  - Greeting system (KeyD interaction)
  - Visual elements: name tags, circle selector
  - Costume system with equipment parts

### 2. World Content Management

#### Tile System
- **API Endpoints**: GET, POST, PATCH, DELETE for tile management
- **Features**: Grid-based tile placement and management
- **Types**: Various tile types for world building

#### Wall System
- **Purpose**: 3D wall placement and management
- **Integration**: Works with tile system for complete environment

#### 3D Objects (ThreeObjects)
- **Management**: Dynamic 3D object placement
- **API**: CRUD operations for object persistence
- **Features**: GLTF model support

#### NPC System
- **Purpose**: Non-player character management
- **Features**: Interactive NPCs with positioning system

### 3. UI/UX Components

#### Slider Systems
- **LeftSlider**: Tool palette and mesh selection
- **RightSlider**: Property panels and settings
- **Features**: Collapsible panels with tab navigation

#### Modal System
- **Global Modal**: Centralized modal management
- **Types**: Multiple modal types (board, auth, settings, etc.)
- **State Management**: Jotai-based modal state

#### Toast Notifications
- **Purpose**: User feedback system
- **Features**: Async toast messages with auto-dismiss

## State Management Architecture

### 1. Jotai Atoms Structure
```
Global State Atoms:
├── modalAtom - Modal state management
├── speechBalloonAtom - Character speech system
├── zoomAtom - Camera zoom controls
├── rotationAtom - Camera rotation
└── Various feature-specific atoms
```

### 2. React Query Integration
```
Query Keys:
├── ["user"] - User authentication state
├── Board-related queries
├── Tile management queries
└── Asset loading queries
```

### 3. Store Organization
```
src/legacy/store/
├── auth/ - Authentication state
├── board/ - Board/guestbook system
├── check/ - User verification
├── modal/ - Modal management
├── toast/ - Notification system
├── options/ - User preferences
└── Various entity stores (tile, wall, npc, etc.)
```

## API Architecture

### 1. API Builder Pattern
The system uses a custom API builder for consistent HTTP requests:
```typescript
APIBuilder.get(endpoint)
  .baseURL(SERVER_URL)
  .setAuth()
  .build()
```

### 2. Main API Categories

#### Authentication APIs
- `checkApi()` - Token validation
- `loginApi()` - User login
- `registerApi()` - User registration
- Token caching with localStorage

#### Content Management APIs
- **Tiles**: CRUD operations for tile management
- **Walls**: Wall placement and modification
- **ThreeObjects**: 3D object management
- **NPCs**: Character management
- **Portals**: Teleportation system
- **Board**: Guestbook/message system

#### Save System
- **Room Saving**: Comprehensive world state persistence
- **Batch Operations**: Multiple entity type saving
- **Incremental Updates**: Partial world updates

## Performance Optimizations

### 1. Rendering Optimizations
- **Frame Loop Control**: `frameloop="demand"` for Canvas
- **Memoization**: React.useMemo for expensive components
- **Lazy Loading**: Code splitting for large components

### 2. State Optimizations
- **Atom Separation**: Granular state management
- **Query Caching**: Infinite stale time for stable data
- **Component Isolation**: Separate render cycles

### 3. Asset Management
- **GLTF Loading**: Efficient 3D model loading
- **Texture Caching**: Browser-level asset caching
- **Progressive Loading**: Lazy component loading

## Development Patterns

### 1. Component Structure
```
ComponentName/
├── index.tsx - Main component logic
├── styles.css - Component-specific styles
└── types.ts - Type definitions (when needed)
```

### 2. Hook Patterns
- Custom hooks for API integration
- State management hooks
- Effect hooks for side effects

### 3. Error Handling
- Global error boundaries
- API error handling with toast notifications
- Graceful degradation for missing features

## Key Features

### 1. World Exploration Mode
- Character movement with physics
- Real-time 3D interaction
- Social features (greetings, speech)
- Minimap navigation

### 2. Room Editing Mode
- Real-time world editing
- Multi-user collaboration potential
- Asset management interface
- Save/load system

### 3. Social Features
- Guestbook/board system
- Character customization
- Speech balloon system
- Interactive elements

## Technical Debt & Limitations

### 1. Architecture Issues
- Mixed concerns in some components
- Global state scattered across multiple atoms
- Inconsistent error handling patterns

### 2. Performance Concerns
- No virtual scrolling for large lists
- Potential memory leaks in 3D scenes
- Limited asset optimization

### 3. Code Quality
- Some components too large (Player component: 118 lines)
- API layer could be more abstracted
- Limited TypeScript strictness in places

## Migration Considerations

### 1. Core Systems to Preserve
- Authentication and authorization logic
- 3D world rendering foundation
- Physics integration
- Save/load mechanisms

### 2. Systems Requiring Refactoring
- State management consolidation
- Component separation of concerns
- API layer abstraction
- Performance optimization

### 3. Feature Modernization
- Real-time collaboration
- Better asset pipeline
- Enhanced physics system
- Improved UI/UX patterns

This legacy system represents a functional 3D metaverse platform with solid foundations in 3D rendering, user management, and world editing capabilities, but requires architectural improvements for scalability and maintainability. 