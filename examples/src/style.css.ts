import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { fixed, flex, sprinkles } from '../styles';
import { vars } from '../styles/theme.css';

const PretendardFont =
  "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

export const keyBoardToolTipOuter = style([
  flex({
    column: '6',
  }),
  {
    position: 'fixed',
    bottom: '0',
    left: '50%',
    transform: 'translate(-50%, 0)',
    width: '45vw',
    height: '25vh',
  },
]);

export const minimapOuter = style([flex({})]);

export const gameBoyOuter = style([
  fixed({
    south_east: true,
  }),
  flex({
    column: '7',
  }),
  sprinkles({
    display: {
      desktop: 'none',
      laptop: 'none',
      tablet: 'flex',
      mobile: 'flex',
    },
  }),
  {
    width: '100%',
  },
]);

export const joystickOuter = style([
  fixed({
    south_west: true,
  }),
  {
    margin: '1rem',
    width: '100px',
    height: '100px',
  },
]);

export const footer = style([
  {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    height: '50rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
  },
]);

export const footerUpper = style([
  fixed({
    south_east: true,
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    bottom: '8rem',
    right: '0',
    zIndex: '10',
  },
]);

export const footerLower = style([
  fixed({
    south_west: true,
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    bottom: '0',
    left: '0',
    zIndex: '10',
  },
]);

export const blackHanSans = style({
  fontFamily: PretendardFont,
});

export const main = style([
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: vars.gradient.lightGreen,
    fontFamily: PretendardFont,
  },
]);

export const mainButtonContainer = style([
  {
    position: 'fixed',
    zIndex: 100,
    top: '1rem',
    left: '1rem',
    display: 'grid',
    flexDirection: 'row',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
  },
]);

export const button = recipe({
  base: [
    {
      boxSizing: 'border-box',
      width: '7.5rem',
      height: '4rem',
      borderRadius: '1rem',
      fontSize: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      boxShadow: '0 0 0.5rem rgba(0, 0, 0, 0.5)',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in',
      margin: '0.5rem',
    },
  ],
  variants: {
    control: {
      true: {
        background: vars.gradient.lightGreen,
        boxShadow: '0 0 1rem rgba(5,222,250,1)',
        color: 'black',
        ':hover': {
          boxShadow: '0 0 3rem rgba(5,222,250,1)',
        },
      },
    },
  },
});

export const gamePad = style([
  fixed({
    south_east: true,
  }),
  {
    margin: '1rem',
    width: '200px',
    height: '200px',
  },
]);

export const jump = style([
  fixed({
    west: true,
  }),
  {
    marginRight: '5rem',
    width: '12rem',
    zIndex: 10000,
  },
]);

export const demoBackGroundImage = 'https://jigglog.s3.ap-northeast-2.amazonaws.com/space.jpg';

export const helpPanel = style({
  position: 'fixed',
  top: '20px',
  right: '20px',
  width: '320px',
  maxHeight: '70vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  backdropFilter: 'blur(10px)',
  color: 'white',
  fontSize: '14px',
  fontFamily: PretendardFont,
  letterSpacing: '0.3px',
  lineHeight: '1.5',
  zIndex: 500,
  overflow: 'auto',
});

// helpPanel 내부 요소들에 직접 스타일 적용
globalStyle(`${helpPanel} h3`, {
  margin: '0 0 16px 0',
  color: '#4CAF50',
  fontSize: '18px',
  fontWeight: '600',
  borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
  paddingBottom: '8px',
});

globalStyle(`${helpPanel} h4`, {
  margin: '0 0 8px 0',
  color: '#81C784',
  fontSize: '15px',
  fontWeight: '500',
});

globalStyle(`${helpPanel} ul`, {
  margin: '0 0 16px 0',
  paddingLeft: '16px',
  listStyle: 'disc',
});

globalStyle(`${helpPanel} li`, {
  marginBottom: '4px',
  lineHeight: '1.5',
  fontSize: '14px',
});

globalStyle(`${helpPanel} strong`, {
  color: '#A5D6A7',
  fontWeight: '600',
});

export const helpContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
});

export const helpSection = style({
  marginBottom: '18px',
});

// 탭 스타일 추가
export const tabHeader = style({
  display: 'flex',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  marginBottom: '16px',
});

export const tabButton = style({
  background: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.7)',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  borderBottom: '2px solid transparent',
  ':hover': {
    color: '#A5D6A7',
    background: 'rgba(255, 255, 255, 0.05)',
  },
});

export const tabButtonActive = style({
  color: '#4CAF50',
  borderBottom: '2px solid #4CAF50',
  background: 'rgba(76, 175, 80, 0.1)',
});

export const tabContent = style({
  animation: 'fadeIn 0.3s ease-in-out',
});

// 텔레포트 버튼 스타일 (통일된 색상)
export const teleportButton = style({
  padding: '8px 12px',
  background: 'rgba(76, 175, 80, 0.9)', // 통일된 녹색
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '500',
  fontFamily: PretendardFont,
  transition: 'all 0.2s ease',
  minWidth: '100px',
  textAlign: 'left' as const,
  ':hover': {
    background: 'rgba(76, 175, 80, 1)',
    transform: 'translateX(-2px)',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  },
});

// 애니메이션 키프레임
globalStyle('@keyframes fadeIn', {
  from: { opacity: 0, transform: 'translateY(10px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});
