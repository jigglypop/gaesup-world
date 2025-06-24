import React, { useState, useRef, useCallback, useEffect } from 'react';

// New SVG Icons for panel controls
const MinimizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface ResizablePanelProps {
  children: React.ReactNode;
  title: string;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizeHandles?: ('right' | 'bottom' | 'corner')[];
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  onMinimize?: () => void;
  draggable?: boolean;
  icon?: string;
  onDrop?: (x: number, y: number) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  title,
  initialWidth = 280,
  initialHeight = 400,
  minWidth = 200,
  minHeight = 150,
  maxWidth = 600,
  maxHeight = 800,
  resizeHandles = ['right'],
  className = '',
  style = {},
  onClose,
  onMinimize,
  draggable = true,
  icon,
  onDrop
}) => {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!panelRef.current) return;

    if (isResizing) {
      const rect = panelRef.current.getBoundingClientRect();
      
      let newWidth = size.width;
      let newHeight = size.height;

      if (resizeDirection.includes('right')) {
        newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX - rect.left));
      }
      
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.min(maxHeight, Math.max(minHeight, e.clientY - rect.top));
      }

      setSize({ width: newWidth, height: newHeight });
    } else if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isResizing, isDragging, resizeDirection, size, minWidth, maxWidth, minHeight, maxHeight, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && onDrop) {
      onDrop(position.x, position.y);
    }
    setIsResizing(false);
    setIsDragging(false);
    setResizeDirection('');
  }, [isDragging, onDrop, position]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!draggable || isResizing) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [draggable, isResizing]);

  useEffect(() => {
    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className={`rp-panel ${className} ${isDragging ? 'dragging' : ''}`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        ...(isDragging ? {
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 10003
        } : {}),
        ...style,
      }}
    >
      <div 
        ref={headerRef}
        className="rp-header"
        onMouseDown={handleDragStart}
      >
        <h3 className="rp-title">{title}</h3>
        <div className="rp-controls">
          {onMinimize && (
            <button className="rp-btn" onClick={onMinimize} title="Minimize">
              <MinimizeIcon />
            </button>
          )}
          {onClose && (
            <button className="rp-btn" onClick={onClose} title="Close">
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
      
      <div className="rp-content">
        {children}
      </div>
      
      {resizeHandles.map(handle => (
        <div
          key={handle}
          className={`rp-resize-handle handle-${handle}`}
          onMouseDown={handleMouseDown(handle.replace('corner', 'right bottom'))}
        />
      ))}
    </div>
  );
}; 