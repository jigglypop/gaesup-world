import { useI18nStore } from '../../../src';

let registered = false;

export function registerSeedI18n(): void {
  if (registered) return;
  registered = true;
  useI18nStore.getState().registerBundle({
    ko: {
      'app.welcome': '환영합니다',
      'hud.inventory': '인벤토리',
      'hud.quest': '퀘스트',
      'hud.mail': '우편',
      'hud.catalog': '도감',
      'hud.craft': '제작',
      'hud.shop': '상점',
      'hud.character': '캐릭터',
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
      'tool.use': '使用',
      'common.close': '閉じる',
    },
  });
}
