import React, { useState } from 'react';

// A simple folder icon component
const FolderIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V7M4 7C4 5.89543 4.89543 5 6 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L11.7071 6.70711C11.8946 6.89464 12.149 7 12.4142 7H18C19.1046 7 20 7.89543 20 9V7" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// A simple file icon component
const FileIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const mockAssets = [
  { id: 'folder1', name: 'Characters', type: 'folder' },
  { id: 'folder2', name: 'Environments', type: 'folder' },
  { id: 'folder3', name: 'Props', type: 'folder' },
  { id: 'model1', name: 'Player.gltf', type: 'model' },
  { id: 'tex1', name: 'Grass_d.png', type: 'texture' },
  { id: 'tex2', name: 'Rock_n.png', type: 'texture' },
  { id: 'mat1', name: 'Ground.mat', type: 'material' },
];

export function AssetBrowserPanel() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <div className="asset-browser-panel">
      <div className="asset-grid editor-scrollbar">
        {mockAssets.map(asset => (
          <div 
            key={asset.id} 
            className={`asset-item ${selectedAsset === asset.id ? 'selected' : ''}`}
            onClick={() => setSelectedAsset(asset.id)}
          >
            <div className="asset-preview">
              {asset.type === 'folder' ? <FolderIcon/> : <FileIcon/>}
            </div>
            <div className="asset-info">
              <div className="asset-name">{asset.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="asset-footer">
        <span className="asset-path">Content / Characters /</span>
        <div className="asset-actions">
          <button className="editor-glass-button">Import</button>
        </div>
      </div>
    </div>
  );
} 