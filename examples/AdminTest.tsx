import { GaesupAdmin } from '../src/admin';

export default function AdminTest() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GaesupAdmin>
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          Admin Test Page
          <br />
          Login: admin / password
        </div>
      </GaesupAdmin>
    </div>
  );
} 