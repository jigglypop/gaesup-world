import { useI18nStore } from '../../../src';

let registered = false;

export function registerSeedI18n(): void {
  if (registered) return;
  registered = true;
  useI18nStore.getState().registerBundle({
    ko: {
      'app.welcome': '가에섭 월드에 오신 것을 환영합니다',
      'hud.inventory': '인벤토리',
      'hud.quest': '퀘스트',
      'hud.mail': '우편',
      'hud.catalog': '도감',
      'hud.craft': '제작',
      'hud.shop': '상점',
      'hud.character': '캐릭터',
      'hud.audio': '사운드',
      'hud.locale': '언어',
      'tool.use': '사용',
      'common.close': '닫기',
    },
    en: {
      'app.welcome': 'Welcome to Gaesup World',
      'hud.inventory': 'Inventory',
      'hud.quest': 'Quests',
      'hud.mail': 'Mail',
      'hud.catalog': 'Catalog',
      'hud.craft': 'Craft',
      'hud.shop': 'Shop',
      'hud.character': 'Character',
      'hud.audio': 'Audio',
      'hud.locale': 'Language',
      'tool.use': 'Use',
      'common.close': 'Close',
    },
    ja: {
      'app.welcome': 'ガエサップワールドへようこそ',
      'hud.inventory': 'インベントリ',
      'hud.quest': 'クエスト',
      'hud.mail': 'メール',
      'hud.catalog': '図鑑',
      'hud.craft': '製作',
      'hud.shop': '商店',
      'hud.character': 'キャラクター',
      'hud.audio': 'サウンド',
      'hud.locale': '言語',
      'tool.use': '使用',
      'common.close': '閉じる',
    },
  });
}
