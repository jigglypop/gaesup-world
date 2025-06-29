import { useAuthStore } from '../../store/authStore';
import './styles.css';

export default function Loading() {
  const loading = useAuthStore(state => state.loading);

  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  );
} 