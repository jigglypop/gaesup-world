import os

def get_language(extension):
    """
    파일 확장자에 따라 코드 블록의 언어를 반환합니다.
    """
    mapping = {
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.css.ts': 'typescript',  # CSS-in-JS 로직을 고려하여 'typescript'로 지정
    }
    return mapping.get(extension, '')

def extract_code_separated(folder_path, output_md, supported_extensions):
    """
    지정된 폴더 내의 특정 확장자를 가진 파일들을 확장자별로 그룹화하여 Markdown 파일로 저장합니다.
    """
    # 확장자별 파일 목록 초기화
    files_by_extension = {ext: [] for ext in supported_extensions}
    
    # 폴더를 재귀적으로 탐색하여 파일 분류
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            for ext in supported_extensions:
                if file.endswith(ext):
                    relative_path = os.path.relpath(os.path.join(root, file), folder_path)
                    files_by_extension[ext].append(relative_path)
                    break
    
    # Markdown 파일 열기
    with open(output_md, 'w', encoding='utf-8') as md_file:
        md_file.write('# 코드 추출 결과\n\n')
        
        for ext in supported_extensions:
            if files_by_extension[ext]:
                # 섹션 제목 작성
                if ext == '.ts':
                    section_title = '## TypeScript Files (.ts)'
                elif ext == '.tsx':
                    section_title = '## TypeScript React Files (.tsx)'
                elif ext == '.css.ts':
                    section_title = '## CSS TypeScript Files (.css.ts)'
                else:
                    section_title = f'## {ext} Files'
                
                md_file.write(f'{section_title}\n\n')
                
                for relative_path in files_by_extension[ext]:
                    file_path = os.path.join(folder_path, relative_path)
                    language = get_language(ext)
                    
                    # 파일 내용 읽기
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            code = f.read()
                    except Exception as e:
                        print(f"파일을 읽는 중 오류 발생: {file_path}\n오류 내용: {e}")
                        continue
                    
                    # 파일명을 소제목으로 추가
                    md_file.write(f'### {relative_path}\n\n')
                    
                    # 코드 블록 추가
                    md_file.write(f'```{language}\n{code}\n```\n\n')
    
    print(f"코드 추출이 완료되었습니다. 출력 파일: {output_md}")

if __name__ == "__main__":
    # 파일 확장자를 리스트로 지정
    supported_extensions = [".css.ts"]  # 필요에 따라 확장자 추가
    
    # 폴더 경로와 출력 Markdown 파일 경로 설정
    folder_path = './src'        # 코드 추출할 폴더 경로
    output_md = './output.md'    # 출력할 Markdown 파일 경로
    
    # 폴더 존재 여부 확인
    if not os.path.isdir(folder_path):
        print(f"에러: 지정된 폴더가 존재하지 않습니다: {folder_path}")
        exit(1)
    
    extract_code_separated(folder_path, output_md, supported_extensions)