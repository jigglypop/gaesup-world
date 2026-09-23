import { render, screen } from '@testing-library/react';

import { createAnimatorComponent, createSceneDocument, SCENE_COMPONENT_TYPES } from '../../../../scene-object';
import { InspectorPanel } from '../InspectorPanel';

function renderWithAnimator(controllerId: string, parameters?: Record<string, number | boolean>) {
  const document = createSceneDocument({
    id: 'scene',
    objects: [
      {
        id: 'hero',
        name: 'Hero',
        components: [
          createAnimatorComponent({ controllerId, ...(parameters ? { parameters } : {}) }),
        ],
      },
    ],
  });
  return render(<InspectorPanel sceneDocument={document} selectedObjectId="hero" />);
}

describe('Inspector Animator 구성 요소', () => {
  test('animator 구성 요소 팩토리는 표준 유형을 사용한다', () => {
    const component = createAnimatorComponent({ controllerId: 'gaesup.character' });
    expect(component.type).toBe(SCENE_COMPONENT_TYPES.animator);
    expect(component.type).toBe('gaesup.animator');
    expect(component.data.controllerId).toBe('gaesup.character');
  });

  test('등록된 컨트롤러의 파라미터와 레이어 상태를 표시한다', () => {
    renderWithAnimator('gaesup.character', { locomotion: 1.5 });
    expect(screen.getByText('gaesup.character')).toBeTruthy();
    expect(screen.getByText('locomotion')).toBeTruthy();
    expect(screen.getByText('float · 1.5')).toBeTruthy();
    expect(screen.getAllByText('bool · false')).toHaveLength(3);
    expect(screen.getByText('bool · true')).toBeTruthy();
    expect(screen.getByText('[locomotion], jump, fall, ride')).toBeTruthy();
    expect(screen.queryByText(/"controllerId"/)).toBeNull();
  });

  test('등록되지 않은 컨트롤러는 경고를 표시한다', () => {
    renderWithAnimator('missing.controller');
    expect(screen.getByText('missing.controller')).toBeTruthy();
    expect(screen.getByText('등록되지 않은 Animator 컨트롤러입니다')).toBeTruthy();
  });
});
