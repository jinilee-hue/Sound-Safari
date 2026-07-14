// Sound Safari — 파닉스 TTS 음성 파일 일괄 생성기 (Azure Speech, 뉴럴 보이스)
//
// Azure에서 PCM으로 뽑아 → 무음 구간을 잘라내고 → 음량을 정규화한 뒤
// ../assets/tts/<key>.wav 로 저장합니다. (index.html 이 이 파일을 재생)
//   · 순수 파닉스 소리를 쓰되(정석), 자음이 작게 들리는 문제를 '정규화(증폭)'로 해결.
//   · 무음 제거로 재생이 즉각적이고 파일도 작아짐.
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
//   --force                    이미 있는 파일도 다시 생성 (기본: 있으면 건너뜀)
//   --only=n,f,s               지정한 키만 생성 (일부만 다시 뽑을 때)
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

// 알파벳 = 파닉스 "소리(음소)". 글자 이름(t→"티")이 아니라 소리로 읽습니다. 값은 IPA.
// 모음은 단모음 기준 — cat/bed/pig/log/cup 등 CVC 단어에 맞춤.
const PHONEMES = {
  a:'æ', b:'b', c:'k', d:'d', e:'ɛ', f:'f', g:'ɡ', h:'h', i:'ɪ',
  j:'dʒ', k:'k', l:'l', m:'m', n:'n', o:'ɑ', p:'p', q:'kw', r:'ɹ',
  s:'s', t:'t', u:'ʌ', v:'v', w:'w', x:'ks', y:'j', z:'z',
};
const LETTERS = Object.keys(PHONEMES);

// 파닉스 교육용: 모든 글자는 '순수 음소'로 발음(슈와 등 첨가 금지).
//  자음이 작게 들리는 문제는 소리 자체를 바꾸지 않고 '정규화(증폭)'로만 해결한다.
//  (파열음 b,t,k 등은 원래 아주 짧은 소리 — 짧게 '탁' 나는 게 정상적인 파닉스 음소다.)
function ssml(text, isLetter) {
  const inner = isLetter
    ? `<phoneme alphabet="ipa" ph="${PHONEMES[text]}">${text}</phoneme>`   // 순수 음소
    : text;
  return `<speak version="1.0" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${VOICE}"><prosody rate="-8%">${inner}</prosody></voice>
</speak>`;
}

const ENDPOINT = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
const SR = 24000;                       // 24kHz 16bit mono PCM
const TARGET_RMS = 32768 * 0.20;        // 목표 실효음량 ≈ -14 dBFS (최대한 크게)
const PEAK_LIMIT = 32768 * 0.97;        // 클리핑 방지 상한 ≈ -0.3 dBFS

async function exists(p) { try { await access(p); return true; } catch { return false; } }

// Azure 응답(RIFF WAV)에서 PCM data 청크만 추출
function dataChunk(buf) {
  let o = 12;
  while (o < buf.length - 8) {
    const id = buf.toString('ascii', o, o + 4);
    const sz = buf.readUInt32LE(o + 4);
    if (id === 'data') return buf.subarray(o + 8, o + 8 + sz);
    o += 8 + sz;
  }
  return buf.subarray(44);
}

// 무음 트림 + 음량 정규화(RMS 기준, 피크 리미터). 결과 PCM(Buffer) 반환.
function process16(data) {
  const n = data.length / 2;
  const s = new Int16Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) { s[i] = data.readInt16LE(i * 2); const a = Math.abs(s[i]); if (a > peak) peak = a; }
  if (peak === 0) return Buffer.from(data);

  // 앞뒤 무음 잘라내기 (+30ms 여유)
  const thr = peak * 0.02;
  let start = 0, end = n - 1;
  while (start < n && Math.abs(s[start]) < thr) start++;
  while (end > start && Math.abs(s[end]) < thr) end--;
  const pad = Math.round(SR * 0.03);
  start = Math.max(0, start - pad);
  end = Math.min(n - 1, end + pad);

  // 유효 구간 RMS → 목표까지 증폭, 단 피크가 상한을 넘지 않게 제한
  let sum = 0;
  for (let i = start; i <= end; i++) sum += s[i] * s[i];
  const rms = Math.sqrt(sum / (end - start + 1)) || 1;
  let gain = TARGET_RMS / rms;
  if (peak * gain > PEAK_LIMIT) gain = PEAK_LIMIT / peak;

  const outN = end - start + 1;
  const out = Buffer.alloc(outN * 2);
  for (let i = 0; i < outN; i++) {
    let v = Math.round(s[start + i] * gain);
    v = v < -32768 ? -32768 : v > 32767 ? 32767 : v;
    out.writeInt16LE(v, i * 2);
  }
  return out;
}

function wavFile(pcm) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function synth(text, key, isLetter) {
  const out = join(OUT_DIR, `${key}.wav`);
  if (!FORCE && await exists(out)) { console.log(`· skip  ${key}.wav (이미 있음)`); return 'skip'; }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
      'User-Agent': 'sound-safari-tts',
    },
    body: ssml(text, isLetter),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`${key}: HTTP ${res.status} ${msg.slice(0, 200)}`);
  }
  const pcm = process16(dataChunk(Buffer.from(await res.arrayBuffer())));
  await writeFile(out, wavFile(pcm));
  console.log(`✓ write ${key}.wav (${(pcm.length / 1024).toFixed(1)} KB, ${(pcm.length / 2 / SR).toFixed(2)}s)`);
  return 'ok';
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`▶ 보이스: ${VOICE} · 리전: ${REGION} · 출력: ${OUT_DIR}\n`);

  let jobs = [
    ...WORDS.map(w => ({ text: w, key: w, isLetter: false })),
    ...LETTERS.map(l => ({ text: l, key: l, isLetter: true })),
  ];

  const only = (process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
  if (only) {
    const set = new Set(only.split(',').map(s => s.trim().toLowerCase()));
    jobs = jobs.filter(j => set.has(j.key));
    console.log(`(--only) 대상: ${[...set].join(', ')} → ${jobs.length}개\n`);
  }

  let ok = 0, skip = 0;
  for (const j of jobs) {              // F0 무료 티어 안전하게 순차 실행
    const r = await synth(j.text, j.key, j.isLetter);
    if (r === 'ok') { ok++; await new Promise(s => setTimeout(s, 120)); }
    else skip++;
  }
  console.log(`\n완료: 생성 ${ok}개, 건너뜀 ${skip}개 → ${OUT_DIR}`);
  console.log('index.html 의 TTS_VER 를 올리고 재배포하세요. (파일이 없으면 브라우저 음성으로 자동 폴백)');
}

main().catch(e => { console.error('❌ 실패:', e.message); process.exit(1); });
