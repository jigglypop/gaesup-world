import { GaesupAdmin } from 'gaesup-world/admin';

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
          관리자 예제
          <br />
          로그인: admin / password
        </div>
      </GaesupAdmin>
    </div>
  );
} 
