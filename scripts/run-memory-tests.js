#!/usr/bin/env node

/**
 * Gaesup World 메모리 테스트 실행 스크립트
 * 
 * 사용법:
 * node scripts/run-memory-tests.js [options]
 * 
 * 옵션:
 * --verbose    상세한 메모리 정보 출력
 * --coverage   커버리지 포함 실행
 * --watch      감시 모드
 * --ci         CI 환경용 설정
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 명령행 인수 파싱
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const coverage = args.includes('--coverage');
const watch = args.includes('--watch');
const ci = args.includes('--ci');

// 결과 저장 디렉토리 생성
const resultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Jest 명령 구성
function buildJestCommand() {
  const cmd = ['npx', 'jest'];
  
  // 메모리 테스트 패턴
  cmd.push('--testPathPattern=memory');
  
  // 옵션 추가
  if (verbose) {
    cmd.push('--verbose');
  }
  
  if (coverage) {
    cmd.push('--coverage');
    cmd.push('--coverageDirectory=test-results/coverage');
  }
  
  if (watch) {
    cmd.push('--watch');
  }
  
  if (ci) {
    cmd.push('--ci');
    cmd.push('--maxWorkers=2');
    cmd.push('--silent');
  }
  
  // 메모리 테스트 특화 설정
  cmd.push('--logHeapUsage');
  cmd.push('--detectLeaks');
  cmd.push('--forceExit');
  
  return cmd;
}

// 시스템 정보 수집
function getSystemInfo() {
  const os = require('os');
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024) + 'MB',
    cpus: os.cpus().length,
  };
}

// 메모리 정보 로깅
function logMemoryInfo() {
  const memUsage = process.memoryUsage();
  console.log('\n📊 메모리 사용량:');
  console.log(`  RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
  console.log(`  Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  console.log(`  Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
  console.log(`  External: ${Math.round(memUsage.external / 1024 / 1024)}MB`);
}

// 테스트 결과 분석
function analyzeTestResults(exitCode) {
  console.log('\n📋 테스트 결과 분석:');
  
  if (exitCode === 0) {
    console.log('✅ 모든 메모리 테스트가 성공적으로 완료되었습니다.');
  } else {
    console.log('❌ 일부 테스트가 실패했습니다.');
    console.log('   - 메모리 누수가 감지되었을 가능성이 있습니다.');
    console.log('   - TESTING.md 문서를 참고하여 디버깅하세요.');
  }
  
  // 결과 파일 경로 안내
  if (coverage) {
    console.log('\n📊 커버리지 리포트: test-results/coverage/index.html');
  }
  
  console.log('📁 테스트 결과: test-results/ 폴더를 확인하세요.');
}

// 메인 실행 함수
async function runMemoryTests() {
  console.log('🚀 Gaesup World 메모리 테스트 시작\n');
  
  // 시스템 정보 출력
  if (verbose) {
    const sysInfo = getSystemInfo();
    console.log('🖥️  시스템 정보:');
    Object.entries(sysInfo).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');
  }
  
  // 초기 메모리 상태
  if (verbose) {
    logMemoryInfo();
  }
  
  // Jest 명령 실행
  const jestCmd = buildJestCommand();
  console.log('📝 실행 명령:', jestCmd.join(' '));
  console.log('');
  
  const startTime = Date.now();
  
  const child = spawn(jestCmd[0], jestCmd.slice(1), {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Node.js 메모리 제한 증가
      NODE_OPTIONS: '--max-old-space-size=4096',
      // 가비지 컬렉션 활성화
      NODE_ENV: 'test',
    },
  });
  
  child.on('close', (code) => {
    const duration = Date.now() - startTime;
    console.log(`\n⏱️  실행 시간: ${Math.round(duration / 1000)}초`);
    
    if (verbose) {
      logMemoryInfo();
    }
    
    analyzeTestResults(code);
    process.exit(code);
  });
  
  child.on('error', (error) => {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
    process.exit(1);
  });
}

// 도움말 출력
function showHelp() {
  console.log(`
🧪 Gaesup World 메모리 테스트 실행기

사용법:
  node scripts/run-memory-tests.js [옵션]

옵션:
  --verbose    상세한 메모리 정보 및 시스템 정보 출력
  --coverage   코드 커버리지 포함하여 실행
  --watch      파일 변경 감시 모드로 실행
  --ci         CI 환경용 설정으로 실행
  --help       이 도움말 출력

예시:
  node scripts/run-memory-tests.js --verbose
  node scripts/run-memory-tests.js --coverage --verbose
  node scripts/run-memory-tests.js --watch
  node scripts/run-memory-tests.js --ci

결과:
  - 테스트 결과는 test-results/ 폴더에 저장됩니다
  - 커버리지 리포트는 test-results/coverage/에 생성됩니다
  - 메모리 사용량 정보는 콘솔에 출력됩니다

문제 해결:
  - TESTING.md 문서를 참고하세요
  - 메모리 부족 시 Node.js 메모리 제한을 늘려보세요
  - CI 환경에서는 --ci 옵션을 사용하세요
`);
}

// 메인 실행
if (args.includes('--help')) {
  showHelp();
} else {
  runMemoryTests().catch(error => {
    console.error('❌ 스크립트 실행 중 오류:', error);
    process.exit(1);
  });
} 