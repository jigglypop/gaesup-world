import { type CSSProperties } from 'react';

import {
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  applyCharacterEquipmentPreset,
  toggleCharacterWeapon,
  teleportDestinationToVector3,
  useCharacterStore,
  useGaesupStore,
  useStateSystem,
  useTeleport,
} from 'gaesup-world';

import { TELEPORT_POINTS } from '../teleport/constants';

const VEHICLE_KEY = 'vehicle_main';
const AIRPLANE_KEY = 'airplane_main';

function dispatchToggleKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, code: `Key${key.toUpperCase()}`, bubbles: true }));
}

function createRideState(objectkey: string, objectType: 'vehicle' | 'airplane', displayName: string) {
  return {
    id: objectkey,
    objectkey,
    objectType,
    type: 'rideable' as const,
    maxSpeed: 0,
    acceleration: 0,
    deceleration: 0,
    isOccupied: false,
    displayName,
    name: displayName,
    controls: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    },
  };
}

export function FeatureAccessPanel() {
  const face = useCharacterStore((state) => state.appearance.face);
  const outfits = useCharacterStore((state) => state.outfits);
  const setFace = useCharacterStore((state) => state.setFace);
  const equipOutfit = useCharacterStore((state) => state.equipOutfit);
  const rideable = useGaesupStore((state) => state.rideable);
  const urls = useGaesupStore((state) => state.urls);
  const setMode = useGaesupStore((state) => state.setMode);
  const setRideable = useGaesupStore((state) => state.setRideable);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const { activeState, gameStates, updateGameStates } = useStateSystem();
  const { teleport } = useTeleport();

  const goToDestination = (id: string) => {
    const destination = TELEPORT_POINTS.find((point) => point.id === id);
    if (!destination) return;
    teleport(teleportDestinationToVector3(destination));
  };

  const clearOutfit = () => {
    equipOutfit('hat', null);
    equipOutfit('top', null);
    equipOutfit('bottom', null);
    equipOutfit('shoes', null);
    equipOutfit('face', null);
    equipOutfit('glasses', null);
    equipOutfit('weapon', null);
    equipOutfit('accessory', null);
  };

  const equipTop = (itemId: string) => {
    equipOutfit('top', itemId);
  };

  const mountRideable = (objectkey: string, objectType: 'vehicle' | 'airplane', displayName: string) => {
    const item = rideable[objectkey];
    if (!item) {
      goToDestination(objectType === 'airplane' ? 'airplane-pad' : 'vehicle-pad');
      return;
    }

    const nextUrls: Parameters<typeof setUrls>[0] = {};
    const ridingUrl = item.ridingUrl ?? urls.characterUrl;
    if (ridingUrl) nextUrls.ridingUrl = ridingUrl;
    if (objectType === 'airplane') {
      const airplaneUrl = item.url ?? urls.airplaneUrl;
      if (airplaneUrl) nextUrls.airplaneUrl = airplaneUrl;
    } else {
      const vehicleUrl = item.url ?? urls.vehicleUrl;
      const wheelUrl = item.wheelUrl ?? urls.wheelUrl;
      if (vehicleUrl) nextUrls.vehicleUrl = vehicleUrl;
      if (wheelUrl) nextUrls.wheelUrl = wheelUrl;
    }

    setUrls(nextUrls);
    setMode({ type: objectType });
    updateGameStates({
      canRide: false,
      isRiding: true,
      nearbyRideable: undefined,
      currentRideable: createRideState(objectkey, objectType, displayName),
    });
    setRideable(objectkey, { visible: false });
  };

  const exitRide = () => {
    const current = gameStates.currentRideable;
    if (current?.objectkey) {
      setRideable(current.objectkey, { visible: true, position: activeState.position.clone() });
    }
    setMode({ type: 'character' });
    updateGameStates({
      canRide: false,
      isRiding: false,
      currentRideable: undefined,
      nearbyRideable: undefined,
    });
  };

  return (
    <div style={panelStyle}>
      <header style={headerStyle}>
        <strong>월드 조작</strong>
        <span style={hintStyle}>바닥을 클릭하면 이동합니다</span>
      </header>

      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>캐릭터</div>
        <div style={gridStyle}>
          <button type="button" style={buttonStyle} onClick={() => dispatchToggleKey('o')}>꾸미기</button>
          <button type="button" style={buttonStyle} onClick={() => setFace(face === 'wink' ? 'smile' : 'wink')}>표정</button>
          <button type="button" style={buttonStyle} onClick={() => toggleCharacterWeapon('starter-weapon-layer')}>
            {outfits.weapon ? '무기 끄기' : '무기 켜기'}
          </button>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => applyCharacterEquipmentPreset(DEFAULT_CHARACTER_EQUIPMENT_PRESETS[1]!)}
          >
            의상 세트
          </button>
          <button type="button" style={buttonStyle} onClick={() => equipTop('warrior-cloth-blue')}>파란 상의</button>
          <button type="button" style={buttonStyle} onClick={() => equipTop('warrior-cloth-green')}>초록 상의</button>
          <button type="button" style={buttonStyle} onClick={() => equipTop('warrior-cloth-red')}>빨간 상의</button>
          <button type="button" style={buttonStyle} onClick={() => equipOutfit('bottom', 'starter-bottom-layer')}>하의</button>
          <button type="button" style={buttonStyle} onClick={() => equipOutfit('shoes', 'starter-shoes-layer')}>신발</button>
          <button type="button" style={buttonStyle} onClick={() => equipOutfit('accessory', 'starter-accessory-ring')}>반지</button>
          <button type="button" style={buttonStyle} onClick={clearOutfit}>장비 비우기</button>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>탈것</div>
        <div style={gridStyle}>
          <button type="button" style={buttonStyle} onClick={() => goToDestination('vehicle-pad')}>차량 위치</button>
          <button type="button" style={buttonStyle} onClick={() => mountRideable(VEHICLE_KEY, 'vehicle', '차량')}>차량 탑승</button>
          <button type="button" style={buttonStyle} onClick={() => goToDestination('airplane-pad')}>비행기 위치</button>
          <button type="button" style={buttonStyle} onClick={() => mountRideable(AIRPLANE_KEY, 'airplane', '비행기')}>비행기 탑승</button>
          <button type="button" style={buttonStyle} onClick={exitRide}>내리기</button>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>이동</div>
        <div style={gridStyle}>
          {TELEPORT_POINTS.map((point) => (
            <button key={point.id} type="button" style={buttonStyle} onClick={() => goToDestination(point.id)}>
              {point.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  left: 16,
  top: 84,
  zIndex: 24,
  width: 320,
  maxHeight: 'calc(100vh - 296px)',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 12,
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 8,
  background: 'rgba(18, 20, 28, 0.82)',
  color: '#fff',
  pointerEvents: 'auto',
  boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
};

const hintStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.62)',
  fontSize: 11,
  whiteSpace: 'nowrap',
};

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const sectionTitleStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 6,
};

const buttonStyle: CSSProperties = {
  minHeight: 32,
  padding: '0 9px',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 6,
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
};
