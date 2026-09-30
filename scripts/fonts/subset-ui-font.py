"""Builds public/fonts/GaesupSansVariable.woff2: Pretendard Variable cut down to the glyphs the example UI shows.

Usage: python scripts/fonts/subset-ui-font.py <PretendardVariable.woff2>
Source: Pretendard 1.3.9, packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 (SIL OFL 1.1).
The OFL reserves the name "Pretendard", so the subset is renamed "Gaesup Sans". Characters it lacks, such as
arbitrary Korean typed into the guestbook, fall back glyph by glyph to the next font of the CSS stack.
Requires fontTools and brotli (pip install fonttools brotli).
"""
import pathlib
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'public' / 'fonts' / 'GaesupSansVariable.woff2'
FAMILY = 'Gaesup Sans'
# Text the example shows: its own sources and the engine's runtime UI (dialogs, prompts, toasts, the building editor).
SOURCES = [
    ('examples', ('.ts', '.tsx', '.css')),
    ('src/core/ui', ('.ts', '.tsx')),
    ('src/core/dialog', ('.ts', '.tsx')),
    ('src/core/interactions', ('.ts', '.tsx')),
    ('src/core/building/components/BuildingUI', ('.ts', '.tsx')),
    ('src/core/building/catalog', ('.ts',)),
]
EXTRA = '·…“”‘’–—•×→←↑↓✓✕％'


def used_text() -> str:
    chars = {chr(code) for code in range(0x20, 0x7F)} | set(EXTRA)
    for folder, suffixes in SOURCES:
        for path in (ROOT / folder).rglob('*'):
            if path.suffix in suffixes and '__tests__' not in path.parts:
                chars |= {char for char in path.read_text(encoding='utf8') if ord(char) >= 0x80}
    return ''.join(sorted(chars))


def rename(font: TTFont) -> None:
    names = font['name']
    for record in list(names.names):
        if record.nameID in (1, 16):
            names.setName(FAMILY, record.nameID, record.platformID, record.platEncID, record.langID)
        elif record.nameID in (3, 4, 6):
            text = record.toUnicode().replace('Pretendard Variable', FAMILY).replace('Pretendard', FAMILY)
            if record.nameID == 6:
                text = text.replace(' ', '')
            names.setName(text, record.nameID, record.platformID, record.platEncID, record.langID)


def main() -> None:
    source = pathlib.Path(sys.argv[1])
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.name_languages = ['*']
    options.notdef_outline = True
    font = TTFont(source)
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=used_text())
    subsetter.subset(font)
    rename(font)
    font.flavor = 'woff2'
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUTPUT)
    print(f'{OUTPUT.relative_to(ROOT)}: {len(font.getBestCmap())} characters, {OUTPUT.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
