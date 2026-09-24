import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.order-time-test');
const assertScript = path.join(__dirname, 'order-time.assert.cjs');

// 1. Kompilasi src/lib/orderTimeUtils.ts ke CommonJS.
//    File sumber eksplisit di command line membuat tsconfig.json diabaikan
//    (noEmit tidak ikut berlaku), sehingga file .js benar-benar dihasilkan.
try {
  fs.rmSync(outDir, { recursive: true, force: true });
  execSync(
    'npx tsc src/lib/orderTimeUtils.ts --outDir .order-time-test --module commonjs --target es2020 --esModuleInterop --skipLibCheck',
    { cwd: rootDir, stdio: 'pipe' }
  );

  // 2. Jalankan asersi dua kali: zona WIB (normal) & zona Amerika (mensimulasikan
  //    mesin dengan timezone berbeda tempat bug aslinya muncul).
  const zones = ['Asia/Jakarta', 'America/Los_Angeles'];
  for (const tz of zones) {
    const res = spawnSync(process.execPath, [assertScript], {
      cwd: rootDir,
      env: { ...process.env, TZ: tz },
      encoding: 'utf8'
    });
    process.stdout.write(res.stdout || '');
    process.stderr.write(res.stderr || '');
    if (res.status !== 0) {
      console.error(`FAIL: asersi orderTimeUtils gagal pada timezone ${tz}`);
      process.exit(1);
    }
  }

  console.log('OK — orderTimeUtils konsisten WIB di Asia/Jakarta & America/Los_Angeles');
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}