import { CharacterMenu, MENU_PRESETS, type CharacterMenuPreset } from './index';

/**
 * 예제 1: 기본 사용
 * 가장 간단한 형태로 C 키로 열기/닫기
 */
export function Example1_BasicUsage() {
  return <CharacterMenu toggleKey="C" preset="default" />;
}

/**
 * 예제 2: 빠른 장착용 (사이드바)
 * 게임 플레이 중 빠르게 접근할 수 있는 컴팩트 사이드바
 */
export function Example2_QuickEquipment() {
  return <CharacterMenu toggleKey="E" preset="compact" />;
}

/**
 * 예제 3: 모바일 최적화
 * 화면 하단의 독 레이아웃
 */
export function Example3_MobileOptimized() {
  return <CharacterMenu toggleKey="C" preset="minimal" />;
}

/**
 * 예제 4: 고급 커스터마이징
 * 모든 기능을 포함한 창의적 프리셋
 */
export function Example4_AdvancedCustomization() {
  return <CharacterMenu toggleKey="C" preset="creative" />;
}

/**
 * 예제 5: 제어형 사용
 * React 상태로 메뉴 열기/닫기 제어
 */
export function Example5_Controlled() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>메뉴 열기</button>
      <CharacterMenu open={open} onClose={() => setOpen(false)} preset="default" />
    </>
  );
}

/**
 * 예제 6: 커스텀 색상 프리셋
 * 자신만의 색상 테마를 가진 프리셋
 */
export function Example6_CustomColor() {
  const myPreset: CharacterMenuPreset = {
    id: 'my-theme',
    name: '내 테마',
    layout: 'modal',
    position: {},
    theme: {
      bgColor: 'rgba(15, 25, 40, 0.95)',      // 진한 파랑
      borderColor: 'rgba(100, 200, 255, 0.2)', // 밝은 파랑 테두리
      textColor: '#b0d4ff',                     // 밝은 파랑 텍스트
      accentColor: '#00d9ff',                   // 시안 강조
      blurEffect: true,
    },
    features: {
      zoomControl: true,
      closeUpMode: true,
      previewRotate: true,
      colorPicker: true,
      assetBrowser: true,
      savePresets: false,
    },
    compact: false,
  };

  return <CharacterMenu preset={myPreset} />;
}

/**
 * 예제 7: 좌측 사이드바
 * 게임 인터페이스 좌측에 고정된 메뉴
 */
export function Example7_SidebarLayout() {
  const sidebarPreset: CharacterMenuPreset = {
    id: 'sidebar-left',
    name: '좌측 사이드바',
    layout: 'sidebar-left',
    position: {
      top: '50%',
      left: 12,
      width: 300,
      height: '70vh',
    },
    theme: {
      bgColor: 'rgba(18, 20, 28, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      textColor: '#f3f4f8',
      accentColor: '#7adf90',
      blurEffect: true,
    },
    features: {
      zoomControl: true,
      closeUpMode: true,
      previewRotate: false,
      colorPicker: false,
      assetBrowser: true,
      savePresets: false,
    },
    compact: true,
  };

  return <CharacterMenu preset={sidebarPreset} />;
}

/**
 * 예제 8: 우측 사이드바 (기본 compact 프리셋)
 * 우측에 배치된 컴팩트 메뉴
 */
export function Example8_RightSidebar() {
  return <CharacterMenu preset="compact" />;
}

/**
 * 예제 9: 다중 프리셋 선택기
 * 여러 프리셋 중 선택할 수 있는 UI
 */
export function Example9_MultiplePresets() {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('default');

  const presets = [
    { id: 'default', name: '기본' },
    { id: 'compact', name: '간단함' },
    { id: 'minimal', name: '최소한' },
    { id: 'creative', name: '창의적' },
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPreset(p.id)}
            style={{
              padding: '8px 16px',
              background: selectedPreset === p.id ? '#7adf90' : '#e0e0e0',
              color: selectedPreset === p.id ? '#000' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      <CharacterMenu preset={selectedPreset} toggleKey="C" />
    </>
  );
}

/**
 * 예제 10: 저장된 커스텀 프리셋 사용
 * localStorage에 저장된 프리셋을 로드하여 사용
 */
export function Example10_SavedCustomPresets() {
  const [customPresets, setCustomPresets] = React.useState<
    Record<string, CharacterMenuPreset>
  >({});

  React.useEffect(() => {
    // 예제용 프리셋 생성
    const gamingPreset: CharacterMenuPreset = {
      id: 'gaming',
      name: '게이밍',
      layout: 'sidebar-right',
      position: {
        top: '50%',
        right: 16,
        width: 280,
        height: '60vh',
      },
      theme: {
        bgColor: 'rgba(20, 20, 30, 0.95)',
        borderColor: 'rgba(255, 100, 150, 0.2)',
        textColor: '#f3f4f8',
        accentColor: '#ff6b9d', // 핑크
        blurEffect: true,
      },
      features: {
        zoomControl: true,
        closeUpMode: true,
        previewRotate: false,
        colorPicker: false,
        assetBrowser: true,
        savePresets: false,
      },
      compact: true,
    };

    setCustomPresets({ gaming: gamingPreset });
  }, []);

  return (
    <CharacterMenu
      toggleKey="C"
      preset="gaming"
      customPresets={customPresets}
    />
  );
}

/**
 * 예제 11: 최소 기능 메뉴
 * 색상 선택과 회전만 가능한 간단한 메뉴
 */
export function Example11_MinimalFeatures() {
  const minimalPreset: CharacterMenuPreset = {
    id: 'minimal-features',
    name: '최소 기능',
    layout: 'modal',
    position: {},
    theme: {
      bgColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textColor: '#f3f4f8',
      accentColor: '#ffd84a', // 노랑
      blurEffect: false,
    },
    features: {
      zoomControl: true,
      closeUpMode: false,    // 클로즈업 비활성
      previewRotate: true,
      colorPicker: true,
      assetBrowser: false,   // 장비 브라우저 비활성
      savePresets: false,
    },
    compact: false,
  };

  return <CharacterMenu preset={minimalPreset} />;
}

/**
 * 예제 12: 밝은 테마 프리셋
 * 어두운 배경 대신 밝은 배경 사용
 */
export function Example12_LightTheme() {
  const lightPreset: CharacterMenuPreset = {
    id: 'light',
    name: '밝은 테마',
    layout: 'modal',
    position: {},
    theme: {
      bgColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(0, 0, 0, 0.15)',
      textColor: '#1a1a1a',
      accentColor: '#0066cc',
      blurEffect: true,
    },
    features: {
      zoomControl: true,
      closeUpMode: true,
      previewRotate: true,
      colorPicker: true,
      assetBrowser: true,
      savePresets: false,
    },
    compact: false,
  };

  return <CharacterMenu preset={lightPreset} />;
}

/**
 * 예제 13: 반응형 레이아웃
 * 화면 크기에 따라 다른 프리셋 사용
 */
export function Example13_ResponsiveLayout() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const preset = isMobile ? 'minimal' : 'default';

  return <CharacterMenu preset={preset} toggleKey="C" />;
}

/**
 * 예제 14: 로그인/생성 시 프리셋
 * 새 캐릭터 생성 시 전체 기능이 있는 모달
 */
export function Example14_CharacterCreation() {
  return (
    <CharacterMenu
      preset="creative"  // 전체 기능 포함
      open={true}
      onClose={() => {
        // 캐릭터 생성 완료 시 처리
        console.log('캐릭터 생성 완료');
      }}
    />
  );
}

/**
 * 예제 15: 전체 게임 UI 통합
 * 실제 게임 환경에서의 사용 예
 */
export function Example15_GameIntegration() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState('default');

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 게임 콘텐츠 */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h1>🎮 게임 화면</h1>
          <p>C 키 또는 버튼을 눌러 메뉴 열기</p>
        </div>
      </div>

      {/* UI 컨트롤 */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: 'flex',
          gap: '8px',
          zIndex: 40,
        }}
      >
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            padding: '8px 16px',
            background: '#7adf90',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          👕 스타일
        </button>
      </div>

      {/* 메뉴 */}
      <CharacterMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        preset={selectedPreset}
      />
    </div>
  );
}

// React import for examples
import React from 'react';
