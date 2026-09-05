export const BLUEPRINT_TAG_LABELS: ReadonlyMap<string, string> = new Map([
  ['melee', '근접'], ['tank', '방어형'], ['starter', '기본'],
  ['magic', '마법'], ['ranged', '원거리'], ['fire', '화염'],
  ['land', '지상'], ['fast', '고속'], ['small', '소형'], ['custom', '사용자 지정'],
]);

export const BLUEPRINT_TYPE_LABELS: ReadonlyMap<string, string> = new Map([
  ['character', '캐릭터'], ['vehicle', '차량'], ['airplane', '비행기'],
  ['animation-sequence', '애니메이션 시퀀스'], ['behavior-tree', '행동 트리'],
  ['animation', '애니메이션'], ['behavior', '행동'], ['item', '아이템'],
]);

export const BLUEPRINT_FIELD_LABELS: Readonly<Record<string, string>> = {
  id: '식별자', name: '이름', description: '설명', version: '버전', tags: '태그',
  type: '유형', metadata: '추가 정보', physics: '물리', mass: '질량', height: '높이',
  radius: '반지름', jumpForce: '점프 힘', moveSpeed: '이동 속도', runSpeed: '달리기 속도',
  airControl: '공중 조작', maxSpeed: '최고 속도', acceleration: '가속', braking: '제동',
  turning: '회전', lift: '양력', drag: '항력', suspension: '서스펜션',
  animations: '애니메이션', idle: '대기', walk: '걷기', run: '달리기', jump: '점프',
  start: '시작', loop: '반복', land: '착지', combat: '전투', special: '특수 동작',
  moving: '이동', flying: '비행', wheels: '바퀴', propeller: '프로펠러',
  behaviors: '행동', data: '데이터', stats: '능력치', health: '체력', stamina: '지구력',
  mana: '마나', strength: '공격력', defense: '방어력', speed: '속도',
  visuals: '외형', parts: '구성 요소', model: '모델', textures: '텍스처', materials: '재질',
  scale: '크기', camera: '카메라', controls: '조작', seats: '좌석', position: '위치',
  rotation: '회전', isDriver: '운전석', mode: '모드', distance: '거리', fov: '시야각',
  smoothing: '보간', enableCollision: '충돌 사용', enableZoom: '확대 사용', zoomSpeed: '확대 속도',
  minZoom: '최소 확대', maxZoom: '최대 확대', enableKeyboard: '키보드 사용',
  enableMouse: '마우스 사용', enableGamepad: '게임패드 사용', clickToMove: '클릭 이동',
  keyMapping: '키 설정', clips: '클립', transitions: '전환', duration: '길이',
  file: '파일', events: '이벤트', time: '시간', from: '시작', to: '대상', condition: '조건',
  attack_light: '가벼운 공격', attack_heavy: '강한 공격', block: '막기', parry: '받아치기',
  cast_fireball: '화염구 시전', cast_meteor: '운석 시전', cast_firewall: '화염벽 시전',
  channel: '집중 시전', meditate: '명상', teleport: '순간 이동',
  initial: '초기 상태', states: '상태 목록', on: '이벤트 전환',
  casting: '시전 중', meditating: '명상 중',
  MOVE: '이동 시작', ATTACK: '공격', STOP: '정지', FINISH: '완료',
  CAST: '시전', MEDITATE: '명상 시작', INTERRUPT: '중단',
  stiffness: '강성', damping: '감쇠', restLength: '기본 길이', maxTravel: '최대 변위',
  url: '파일 경로', color: '색상', attachmentPoint: '장착 지점',
};
