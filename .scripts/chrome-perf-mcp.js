#!/usr/bin/env node
const { exec } = require('child_process');
const port = 9222;

// DevTools front‑end를 Performance 패널로 바로 여는 URL
const devtoolsUrl =
  `devtools://devtools/bundled/inspector.html?panel=performance&` +
  `remoteBase=http://localhost:${port}/json`;

const cmd =
  process.platform === 'win32' ? `start chrome "${devtoolsUrl}"` : `google-chrome "${devtoolsUrl}"`;

exec(cmd, (err) => {
  if (err) {
    console.error('💥 성능 탭 열기 실패:', err);
    process.exit(1);
  }
});
