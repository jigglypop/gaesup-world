import React, { FC } from 'react';
import { EditorLayout } from '../EditorLayout';
import '../../styles/theme.css';
import { EditorProps } from './types';

export const Editor: FC<EditorProps> = ({ 
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