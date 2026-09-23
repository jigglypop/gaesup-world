import { createProjectFile, parseProjectFile, validateProjectFile } from '../projectFile';

describe('프로젝트 파일', () => {
  test('정상 프로젝트 파일은 이슈가 없고 JSON 왕복이 된다', () => {
    const file = createProjectFile({
      startScene: 'town',
      scenes: [{ id: 'town', path: 'scenes/town.scene.json' }],
      requiredScripts: ['gaesup.door'],
    });
    expect(validateProjectFile(file, { isScriptRegistered: () => true })).toEqual([]);
    const parsed = parseProjectFile(JSON.stringify(file));
    expect(parsed.issues).toEqual([]);
    expect(parsed.file?.scenes).toEqual(file.scenes);
  });

  test('시작 씬 누락, 중복 id, 미등록 스크립트를 보고한다', () => {
    const file = createProjectFile({
      startScene: 'missing',
      scenes: [
        { id: 'town', path: 'a.json' },
        { id: 'town', path: 'b.json' },
      ],
      requiredScripts: ['game.unknown'],
    });
    const paths = validateProjectFile(file, { isScriptRegistered: () => false }).map((issue) => issue.path);
    expect(paths).toEqual(['scenes[1].id', 'startScene', 'requiredScripts[0]']);
  });

  test('JSON이 아니면 실패를 보고한다', () => {
    expect(parseProjectFile('{').issues[0]?.message).toBe('JSON 형식이 아닙니다');
  });
});
