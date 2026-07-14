// Sound Safari — 자연스러운 TTS 음성 파일 일괄 생성기 (Azure Speech, 뉴럴 보이스)
//
// 게임에 필요한 단어/알파벳 소리를 고품질 뉴럴 보이스로 한 번에 뽑아
// ../assets/tts/<key>.mp3 로 저장합니다. (index.html 이 이 파일을 재생)
//
// 필요조건: Node 18+ (내장 fetch 사용), Azure Speech 리소스 키
//
// 실행 (PowerShell):
//   cd sound_safari/tools
//   $env:AZURE_KEY="<Azure Speech 키>"; $env:AZURE_REGION="koreacentral"; node generate-tts.mjs
//
// 실행 (bash):
//   AZURE_KEY=<키> AZURE_REGION=koreacentral node generate-tts.mjs
//
// 옵션:
//   --force   이미 있는 mp3도 다시 생성 (기본: 있으면 건너뜀)
//   --voice=en-US-AriaNeural   보이스 변경 (기본: en-US-JennyNeural, 밝은 미국 여성)

import { writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'tts');

const KEY = process.env.AZURE_KEY;
const REGION = process.env.AZURE_REGION || 'koreacentral';
const FORCE = process.argv.includes('--force');
const VOICE = (process.argv.find(a => a.startsWith('--voice=')) || '').split('=')[1] || 'en-US-JennyNeural';

if (!KEY) {
  console.error('❌ AZURE_KEY 환경변수가 없습니다. Azure Portal → Speech 리소스 → 키를 넣어주세요.');
  process.exit(1);
}

// index.html 의 WORDS 와 동일하게 유지하세요.
const WORDS = ['cat','bat','fan','van','rat','log','bus','pig','fox','sun','cup','bed'];

// 알파벳 = 파닉스 "소리(음소)". 글자 이름(t→"티")이 아니라 소리(t→"트")로 읽습니다.
// 값은 IPA(국제음성기호). 모음은 단모음(short vowel) 기준 — cat/bed/pig/log/cup 등 CVC 단어에 맞춤.
const PHONEMES = {
  a:'æ', b:'b', c:'k', d:'d', e:'ɛ', f:'f', g:'ɡ', h:'h', i:'ɪ',
  j:'dʒ', k:'k', l:'l', m:'m', n:'n', o:'ɑ', p:'p', q:'kw', r:'ɹ',
  s:'s', t:'t', u:'ʌ', v:'v', w:'w', x:'ks', y:'j', z:'z',
};
const LETTERS = Object.keys(PHONEMES);

const ENDPOINT = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

// 아동 학습용: 또렷하게 살짝 천천히.
//  - 단어: 그대로 자연스럽게
//  - 글자: 파닉스 소리(음소)로. IPA phoneme 태그 사용.
function ssml(text, isLetter) {
  const inner = isLetter
    ? `<phoneme alphabet="ipa" ph="${PHONEMES[text]}">${text}</phoneme>`
    : text;
  return `<speak version="1.0" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${VOICE}">
    <prosody rate="-8%">${inner}</prosody>
  </voice>
</speak>`;
}

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function synth(text, key, isLetter) {
  const out = join(OUT_DIR, `${key}.mp3`);
  if (!FORCE && await exists(out)) { console.log(`· skip  ${key}.mp3 (이미 있음)`); return 'skip'; }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'sound-safari-tts',
    },
    body: ssml(text, isLetter),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`${key}: HTTP ${res.status} ${msg.slice(0, 200)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(out, buf);
  console.log(`✓ write ${key}.mp3 (${(buf.length / 1024).toFixed(1)} KB)`);
  return 'ok';
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`▶ 보이스: ${VOICE} · 리전: ${REGION} · 출력: ${OUT_DIR}\n`);

  const jobs = [
    ...WORDS.map(w => ({ text: w, key: w, isLetter: false })),
    ...LETTERS.map(l => ({ text: l, key: l, isLetter: true })),
  ];

  let ok = 0, skip = 0;
  for (const j of jobs) {              // F0 무료 티어 안전하게 순차 실행
    const r = await synth(j.text, j.key, j.isLetter);
    if (r === 'ok') { ok++; await new Promise(s => setTimeout(s, 120)); }
    else skip++;
  }
  console.log(`\n완료: 생성 ${ok}개, 건너뜀 ${skip}개 → ${OUT_DIR}`);
  console.log('index.html 을 열어 🔊 스피크 버튼으로 확인하세요. (파일이 없으면 자동으로 브라우저 음성으로 폴백됩니다)');
}

main().catch(e => { console.error('❌ 실패:', e.message); process.exit(1); });
