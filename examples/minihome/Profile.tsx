import { Vector3 } from 'three';

import { useTeleport } from 'gaesup-world';

import { useStored } from './stored';
import { MINIME_MODELS, RESIDENTS, type MinimeModel } from './world';

const MOODS = [
  { emoji: '😊', label: '행복' },
  { emoji: '🥰', label: '설렘' },
  { emoji: '😎', label: '여유' },
  { emoji: '😴', label: '졸림' },
];

export function minimeOf(id: MinimeModel) {
  return MINIME_MODELS.find((model) => model.id === id) ?? MINIME_MODELS[0];
}

/** The left column: who lives here, what they wear, and their 일촌 on the island. */
export function Profile({ minime, onMinime }: { minime: MinimeModel; onMinime: (id: MinimeModel) => void }) {
  const [mood, setMood] = useStored('mood', 0);
  const [status, setStatus] = useStored('status', '오늘도 섬에서 느긋하게 🌿');
  const { teleport, canTeleport } = useTeleport();
  const me = minimeOf(minime);

  return (
    <div className="mh-profile">
      <section className="mh-card mh-me">
        <div className="mh-avatar">
          <span>{me.emoji}</span>
          <em title={MOODS[mood]?.label}>{MOODS[mood]?.emoji}</em>
        </div>
        <div className="mh-me-name">
          <b>개숲이</b>
          <small>{me.label} 미니미</small>
        </div>
        <textarea
          className="mh-status-message"
          value={status}
          maxLength={60}
          rows={2}
          aria-label="상태 메시지"
          onChange={(event) => setStatus(event.target.value)}
        />
        <div className="mh-moods" role="radiogroup" aria-label="오늘의 기분">
          <span>TODAY IS…</span>
          {MOODS.map((option, index) => (
            <button key={option.label} role="radio" aria-checked={mood === index} title={option.label} onClick={() => setMood(index)}>
              {option.emoji}
            </button>
          ))}
        </div>
      </section>

      <section className="mh-card">
        <h3>미니미 바꾸기</h3>
        <div className="mh-minimes">
          {MINIME_MODELS.map((model) => (
            <button key={model.id} aria-pressed={model.id === minime} onClick={() => onMinime(model.id)}>
              <span>{model.emoji}</span>
              <small>{model.label}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="mh-card mh-friends">
        <h3>일촌 <b>{RESIDENTS.length}</b></h3>
        <ul>
          {RESIDENTS.map((resident) => (
            <li key={resident.id}>
              <span className="mh-friend-face">{resident.emoji}</span>
              <div>
                <b>{resident.name}</b>
                <small>{resident.intro}</small>
              </div>
              <button
                disabled={!canTeleport}
                onClick={() => teleport(new Vector3(resident.spot[0], 0.2, resident.spot[1] + 2.4), undefined, { dropHeight: 2 })}
              >
                찾아가기
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
