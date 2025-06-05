import { useAtomValue } from 'jotai';
import { sizesAtom } from '../atoms';

export function SizeDebugger() {
  const sizes = useAtomValue(sizesAtom);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: 10,
      fontSize: 12,
      fontFamily: 'monospace',
      maxWidth: 300,
      maxHeight: 400,
      overflow: 'auto',
      borderRadius: 4,
      zIndex: 9999,
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Loaded Model Sizes</h4>
      {Object.entries(sizes).length === 0 ? (
        <div>No models loaded yet</div>
      ) : (
        Object.entries(sizes).map(([url, size]) => (
          <div key={url} style={{ marginBottom: 5 }}>
            <div style={{ fontWeight: 'bold', color: '#00ff00' }}>
              {url.split('/').pop()}
            </div>
            <div>
              {size.x.toFixed(2)} × {size.y.toFixed(2)} × {size.z.toFixed(2)}
            </div>
          </div>
        ))
      )}
    </div>
  );
} 