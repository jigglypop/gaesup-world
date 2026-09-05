import { CharacterMenu } from '../CharacterMenu';
import type { CharacterCreatorProps } from './types';

const CHARACTER_CREATOR_LABELS = {
  title: '캐릭터 만들기',
  close: '완료',
};
const CHARACTER_CREATOR_FEATURES = {
  savePresets: false,
  tagFilter: true,
  ownedOnly: true,
};

export function CharacterCreator({
  preset = 'creative',
  labels,
  features,
  ...props
}: CharacterCreatorProps = {}) {
  return (
    <CharacterMenu
      {...props}
      preset={preset}
      labels={{ ...CHARACTER_CREATOR_LABELS, ...labels }}
      features={{ ...CHARACTER_CREATOR_FEATURES, ...features }}
    />
  );
}
export type { CharacterCreatorProps };
