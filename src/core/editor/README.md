# Gaesup World Editor

A modern, glassmorphism-styled editor interface for 3D world creation with drag-and-drop panels, customizable layouts, and extensible architecture.

## Features

- **Glassmorphism UI**: Modern, translucent interface with backdrop blur effects
- **Drag & Drop Panels**: Freely move panels anywhere on screen
- **Resizable Components**: Resize panels with smooth animations
- **Panel Management**: Close, minimize, and restore panels
- **Flexible Layout**: Left stack, right stack, and floating panels
- **Responsive Design**: Adapts to different screen sizes
- **Extensible Architecture**: Easy to add custom panels

## Quick Start

### Basic Usage

```tsx
import { Editor } from 'gaesup-world/editor';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Your 3D canvas here */}
      <Canvas>
        {/* ... */}
      </Canvas>
      
      {/* Editor overlay */}
      <Editor />
    </div>
  );
}
```

### Custom Panel Configuration

```tsx
import { EditorLayout } from 'gaesup-world/editor';

function CustomEditor() {
  return (
    <EditorLayout>
      {/* Your custom 3D scene */}
    </EditorLayout>
  );
}
```

## Built-in Panels

### Hierarchy Panel
- Scene object tree view
- Object selection and management
- Nested structure visualization

### Inspector Panel
- Selected object properties
- Real-time value editing
- Transform controls

### Node Editor Panel
- Visual scripting interface
- FSM (Finite State Machine) editor
- Custom node types

### Asset Browser Panel
- Project asset management
- Drag & drop asset placement
- File organization

### Quick Actions Panel
- Common editor commands
- Tool shortcuts
- Control guide

## Panel Management

### Opening/Closing Panels
Click panel buttons in the top bar to toggle panels on/off.

### Moving Panels
- **Drag Header**: Click and drag panel header to move
- **Auto-positioning**: Panels snap to left/right stacks or float freely
- **Multi-panel Stacks**: Multiple panels can stack vertically

### Resizing Panels
- **Right Edge**: Resize width
- **Bottom Edge**: Resize height  
- **Corner Handle**: Resize both dimensions

### Minimizing Panels
- **Minimize Button**: Click `-` button in panel header
- **Restore**: Click minimized panel in bottom dock

## Customization

### Creating Custom Panels

```tsx
interface CustomPanelProps {
  // Your props here
}

const CustomPanel: React.FC<CustomPanelProps> = ({ ... }) => {
  return (
    <div className="custom-panel-content">
      {/* Your panel content */}
    </div>
  );
};

// Register in panel configuration
const customPanelConfig = {
  id: 'custom',
  title: 'Custom Panel',
  component: <CustomPanel />,
  defaultSide: 'right' // 'left' | 'right' | 'floating'
};
```

### Styling

The editor uses CSS custom properties for theming:

```css
:root {
  --editor-primary: #0078d4;
  --editor-secondary: #1f1f1f;
  --editor-surface: rgba(45, 45, 45, 0.95);
  --editor-text: #ffffff;
  --editor-text-secondary: #bbbbbb;
  --editor-glass-bg: rgba(30, 30, 30, 0.15);
  --editor-glass-blur: blur(15px);
}
```

### Glassmorphism Classes

```css
.editor-glass-panel {
  background: var(--editor-glass-bg);
  backdrop-filter: var(--editor-glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.editor-glass-button {
  background: rgba(40, 40, 40, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Architecture

### Component Structure

```
editor/
├── components/
│   ├── Editor/              # Main editor wrapper
│   ├── EditorLayout/        # Layout management
│   ├── ResizablePanel/      # Draggable/resizable panel
│   └── panels/              # Built-in panel components
├── hooks/
│   └── useEditor.ts         # Editor state management
├── stores/
│   └── editorSlice.ts       # Zustand store
└── styles/
    └── theme.css            # Global editor styles
```

### State Management

The editor uses Zustand for state management:

```tsx
import { useEditor } from 'gaesup-world/editor';

function MyComponent() {
  const { 
    activePanels, 
    floatingPanels, 
    minimizedPanels,
    togglePanel,
    closePanel,
    minimizePanel 
  } = useEditor();
  
  // Your component logic
}
```

## Integration Examples

### With React Three Fiber

```tsx
import { Canvas } from '@react-three/fiber';
import { Editor } from 'gaesup-world/editor';

function GameEditor() {
  return (
    <>
      <Canvas>
        {/* Your 3D scene */}
      </Canvas>
      <Editor />
    </>
  );
}
```

### With Gaesup World

```tsx
import { GaesupWorld, Editor } from 'gaesup-world';

function WorldEditor() {
  return (
    <GaesupWorld {...worldProps}>
      <Canvas>
        {/* Game content */}
      </Canvas>
      <Editor />
    </GaesupWorld>
  );
}
```

## Performance

- **Optimized Rendering**: Only visible panels are rendered
- **Smooth Animations**: GPU-accelerated transforms
- **Efficient Updates**: Zustand state management
- **Memory Management**: Automatic cleanup on unmount

## Browser Support

- Chrome 88+
- Firefox 94+
- Safari 14+
- Edge 88+

**Note**: Requires `backdrop-filter` support for glassmorphism effects.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Add your custom panels in `src/core/editor/components/panels/`
4. Update panel configuration in `EditorLayout`
5. Add styles to `theme.css`
6. Test responsiveness and interactions
7. Submit pull request

## License

MIT License - see LICENSE file for details. 