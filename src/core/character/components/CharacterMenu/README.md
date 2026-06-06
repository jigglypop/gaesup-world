# 캐릭터 메뉴 (CharacterMenu)

캐릭터 커스터마이징 메뉴입니다. 기본 기능만 제공합니다.

## 기능

- ✅ **줌인/줌아웃** - 50% ~ 300% 범위
- ✅ **클로즈업 모드** - 캐릭터 접근 보기
- ✅ **색상 선택** - 피부, 머리, 옷 색상 등
- ✅ **기본 커스터마이징** - 이름, 헤어, 표정
- ✅ **장비 교체** - hat, top, bottom, shoes, weapon

## 사용법

```tsx
import { CharacterMenu } from 'gaesup-world';

// 기본
<CharacterMenu toggleKey="C" />

// 제어
const [open, setOpen] = useState(false);
<CharacterMenu open={open} onClose={() => setOpen(false)} />
```

## Props

```typescript
type CharacterMenuProps = {
  toggleKey?: string;  // 메뉴 토글 키 (C, E 등)
  open?: boolean;      // 메뉴 열기/닫기
  onClose?: () => void; // 메뉴 닫을 때 콜백
};
```

## 단축키

- `C` - 메뉴 열기/닫기 (기본값)
- `E` - 다른 키 설정 가능
