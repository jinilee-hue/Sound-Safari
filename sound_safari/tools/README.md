# TTS 음성 파일 생성 (tools/generate-tts.mjs)

게임에서 읽어주는 **단어·알파벳 소리**를 뉴럴 보이스(기본 `en-US-JennyNeural`, 밝은 미국 여성)로 생성합니다.
Azure에서 **PCM으로 받아 → 앞뒤 무음을 잘라내고 → 음량을 정규화(증폭)** 한 뒤 `../assets/tts/*.wav` 로 저장합니다.

파닉스 교육용이라 **모든 글자를 순수 음소(IPA)로 발음**합니다(슈와 첨가 없음). 자음이 원래 작게 들리는 문제는 소리를 바꾸지 않고 **정규화로만** 키웁니다.

`index.html` 은 이 wav 파일을 재생하며(캐시 무력화용 `?v=` 버전 쿼리 부착), **파일이 없으면 자동으로 브라우저 음성으로 폴백**하므로 생성 전에도 게임은 정상 동작합니다.
> 음성 파일을 다시 뽑으면 `index.html` 의 `TTS_VER` 를 +1 하세요 (브라우저·CDN 캐시가 옛 파일을 물지 않도록).

## 준비
- Node 18 이상 (내장 `fetch` 사용, 추가 설치 불필요)
- Azure Speech 리소스 키 — [Azure Portal](https://portal.azure.com) → Speech services 리소스 → **키 및 엔드포인트**
  (발음평가용으로 이미 만든 리소스와 **같은 키**를 쓰면 됩니다. 무료 F0 티어로 충분)

## 실행

PowerShell:
```powershell
cd sound_safari/tools
$env:AZURE_KEY="<Azure Speech 키>"; $env:AZURE_REGION="koreacentral"; node generate-tts.mjs
```

bash:
```bash
cd sound_safari/tools
AZURE_KEY=<키> AZURE_REGION=koreacentral node generate-tts.mjs
```

## 옵션
| 옵션 | 설명 |
|---|---|
| `--force` | 이미 있는 파일도 다시 생성 (기본은 있으면 건너뜀) |
| `--only=n,f,s` | 지정한 키만 생성 (일부만 다시 뽑을 때) |
| `--voice=en-US-AriaNeural` | 보이스 변경. 예) `en-US-AriaNeural`, `en-US-AnaNeural`(어린이 목소리), `en-GB-SoniaNeural`(영국) |

## 생성되는 파일
- 단어 12개: `cat.wav`, `bat.wav`, … `bed.wav`
- 알파벳 26개: `a.wav` … `z.wav` — **파닉스 소리(순수 음소, IPA)**로 읽음 (글자 이름 아님).
  - 모음(a,e,i,o,u): 단모음 (a→/æ/, e→/ɛ/, i→/ɪ/, o→/ɑ/, u→/ʌ/)
  - 자음: 순수 음소 (f→/f/, n→/n/, g→/ɡ/ …). 슈와 등 첨가 없음.
  - 파열음(b,t,k,g …)은 원래 아주 짧은 소리라 '탁' 하고 나는 게 정상.
  - 음량은 전부 정규화(≈ -14 dBFS, 피크 리미터)로 통일 — 자음도 모음만큼 크게 들림.
  - 소리를 바꾸려면 스크립트의 `PHONEMES` 맵(IPA)을 수정하세요.

> 단어를 추가·변경하면 `index.html` 의 `WORDS` 와 이 스크립트의 `WORDS` 를 함께 맞춰주세요.
