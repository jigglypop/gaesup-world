import { useToast } from "../../store/toastStore";
import './styles.css';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type || 'info'}`}
          onClick={() => removeToast(toast.id)}>
          {toast.text}
        </div>
      ))}
    </div>
  );
} 