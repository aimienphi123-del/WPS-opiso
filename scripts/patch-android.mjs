// Chạy sau "npx cap add android": vá dự án Android để WPScraft
//  1) xuất hiện trong danh sách "Mở bằng" / "Chia sẻ" của Android,
//  2) có plugin nhận tệp (WpsFilePlugin),
//  3) dùng biểu tượng capybara và màn hình chờ riêng.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'capacitor.config.json'), 'utf8'));
const pkg = cfg.appId;
const androidMain = join(root, 'android', 'app', 'src', 'main');

function fail(msg) {
  console.error('LỖI patch-android: ' + msg);
  process.exit(1);
}
if (!existsSync(androidMain)) fail('Chưa có thư mục android/. Hãy chạy "npx cap add android" trước.');

// ---------- 1) AndroidManifest: các intent-filter ----------
const manifestPath = join(androidMain, 'AndroidManifest.xml');
let manifest = readFileSync(manifestPath, 'utf8');
const MARK = 'WPSCRAFT-INTENT-FILTERS';

const mimes = [
  'application/pdf',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
  'application/vnd.amazon.ebook',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
// Tệp tải từ web hay bị gắn kiểu chung này nên cũng phải nhận.
const generic = ['application/octet-stream', 'application/x-zip-compressed'];
const exts = ['pdf', 'epub', 'mobi', 'azw', 'azw3', 'docx', 'txt'];

const dataMimes = (list) => list.map((m) => `                <data android:mimeType="${m}" />`).join('\n');
const pathData = (scheme) =>
  exts
    .flatMap((e) => [e, e.toUpperCase()])
    .map((e) => `                <data android:scheme="${scheme}" android:host="*" android:pathPattern=".*\\\\.${e}" />`)
    .join('\n');

const filters = `
            <!-- ${MARK} (do scripts/patch-android.mjs thêm) -->
            <!-- Bấm mở tệp (có kiểu MIME rõ ràng) -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="content" />
                <data android:scheme="file" />
${dataMimes([...mimes, ...generic])}
            </intent-filter>
            <!-- Bấm mở tệp theo đuôi file (tệp file://) -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
${pathData('file')}
${pathData('content')}
            </intent-filter>
            <!-- Chia sẻ tệp tới WPScraft -->
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
${dataMimes([...mimes, ...generic])}
            </intent-filter>
`;

if (!manifest.includes(MARK)) {
  const idx = manifest.indexOf('</activity>');
  if (idx < 0) fail('Không tìm thấy </activity> trong AndroidManifest.xml.');
  manifest = manifest.slice(0, idx) + filters + '        ' + manifest.slice(idx);
  writeFileSync(manifestPath, manifest);
  console.log('Đã thêm intent-filter vào AndroidManifest.xml');
}

// ---------- 2) Mã Java: MainActivity + plugin ----------
const javaDir = join(androidMain, 'java', ...pkg.split('.'));
mkdirSync(javaDir, { recursive: true });
for (const f of ['MainActivity.java', 'WpsFilePlugin.java']) {
  const src = readFileSync(join(root, 'scripts', 'android-src', f), 'utf8').replaceAll('__PACKAGE__', pkg);
  writeFileSync(join(javaDir, f), src);
}
console.log('Đã ghi MainActivity.java và WpsFilePlugin.java vào ' + javaDir);

// ---------- 3) Biểu tượng capybara + màn hình chờ ----------
const res = join(androidMain, 'res');
const resSrc = join(root, 'resources', 'android');
if (existsSync(resSrc)) {
  for (const d of readdirSync(resSrc)) cpSync(join(resSrc, d), join(res, d), { recursive: true });
  writeFileSync(
    join(res, 'values', 'ic_launcher_background.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#F3E6C8</color>\n</resources>\n',
  );
  // Vector nền/foreground mặc định của Capacitor không còn dùng.
  rmSync(join(res, 'drawable-v24', 'ic_launcher_foreground.xml'), { force: true });
  console.log('Đã thay biểu tượng và màn hình chờ.');
} else {
  console.warn('Không có thư mục resources/android, giữ biểu tượng mặc định.');
}
