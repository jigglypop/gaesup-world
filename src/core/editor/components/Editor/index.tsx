import React from 'react';
import { EditorLayout } from '../EditorLayout';
import '../../styles/theme.css';

interface EditorProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Editor: React.FC<EditorProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`gaesup-editor ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
        ...style
      }}
    >
      <EditorLayout>
        {children}
      </EditorLayout>
    </div>
  );
};

export default Editor; 