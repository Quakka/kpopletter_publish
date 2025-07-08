const fs = require('fs');
const path = require('path');

// 환경변수 읽기
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

// index.html 읽기
let html = fs.readFileSync('index.html', 'utf8');

// 환경변수 치환
html = html.replace('YOUR_SUPABASE_URL', SUPABASE_URL || 'YOUR_SUPABASE_URL');
html = html.replace('YOUR_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY');
html = html.replace(/YOUR_RECAPTCHA_SITE_KEY/g, RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY');

// dist 폴더 생성 및 파일 복사
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// 모든 파일 복사
fs.writeFileSync('dist/index.html', html);
fs.copyFileSync('Logo_Miner7_Final.png', 'dist/Logo_Miner7_Final.png');

// favicon 폴더 복사
if (!fs.existsSync('dist/favicon')) {
  fs.mkdirSync('dist/favicon');
}
fs.readdirSync('favicon').forEach(file => {
  fs.copyFileSync(`favicon/${file}`, `dist/favicon/${file}`);
});

console.log('Build completed successfully!');