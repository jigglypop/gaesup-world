import React, { FC } from 'react';
import { EditorLayout } from '../EditorLayout';
import '../../styles/theme.css';
import { EditorProps } from './types';
import './styles.css'

export const Editor: FC<EditorProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`gaesup-editor ${className}`}
      style={{
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