const MINIMAP_SIZE = 200; // px 단위로 고정
// 기본 스타일
export const baseStyles = {
  minimap: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: `${MINIMAP_SIZE}px`,
    height: `${MINIMAP_SIZE}px`,
    zIndex: 100,
    cursor: 'pointer',
  },
  scale: {
    position: 'absolute',
    bottom: '20px',
    left: '230px',
    zIndex: 101,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    background: 'rgba(0,0,0,0.5)',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
  },
  plusMinus: {
    cursor: 'pointer',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(0,0,0,0.7)',
    },
  },
};

// 방향 표시 스타일
export const directionStyles = {
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
};

// 기본 오브젝트 스타일
export const objectStyles = {
  background: 'rgba(0,0,0,0.3)',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
};

// 아바타 스타일
export const avatarStyles = {
  background: '#01fff7',
  boxShadow: '0 0 10px rgba(1,255,247,0.7)',
};
// 텍스트 스타일
export const textStyles = {
  color: 'white',
  fontSize: '1rem',
  fontWeight: 'bold',
};

export const MINIMAP_SIZE_PX = MINIMAP_SIZE;
