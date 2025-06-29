import { useAuthStore } from "../../store/authStore";
import './styles.css';

export default function ModalContainer() {
  const modal = useAuthStore(state => state.modal);
  const setModal = useAuthStore(state => state.setModal);

  const closeModal = () => {
    setModal({
      on: false,
      type: "",
      file: -1,
      username: "",
      gltf_url: "",
    });
  };

  if (!modal.on) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modal - {modal.type}</h3>
          <button className="modal-close" onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {modal.type === "board" && (
            <div>
              <h4>방명록 작성</h4>
              <textarea placeholder="메시지를 입력하세요..." rows={4} />
              <button>작성하기</button>
            </div>
          )}
          {modal.type === "settings" && (
            <div>
              <h4>설정</h4>
              <div className="setting-item">
                <label>볼륨:</label>
                <input type="range" min="0" max="100" defaultValue="50" />
              </div>
              <div className="setting-item">
                <label>그래픽 품질:</label>
                <select>
                  <option>낮음</option>
                  <option>보통</option>
                  <option>높음</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 