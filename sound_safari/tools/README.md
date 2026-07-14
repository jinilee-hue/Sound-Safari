# TTS 음성 파일 생성 (tools/generate-tts.mjs)

게임에서 읽어주는 **단어·알파벳 소리**를 자연스러운 뉴럴 보이스(기본 `en-US-JennyNeural`, 밝은 미국 여성)로 한 번에 생성해 `../assets/tts/*.mp3` 로 저장합니다.

`index.html` 은 이 mp3 파일을 재생하며, **파일이 없으면 자동으로 브라우저 음성으로 폴백**하므로 생성 전에도 게임은 정상 동작합니다.

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
| `--force` | 이미 있는 mp3도 다시 생성 (기본은 있으면 건너뜀) |
| `--voice=en-US-AriaNeural` | 보이스 변경. 예) `en-US-AriaNeural`, `en-US-AnaNeural`(어린이 목소리), `en-GB-SoniaNeural`(영국) |

## 생성되는 파일
- 단어 12개: `cat.mp3`, `bat.mp3`, … `bed.mp3`
- 알파벳 26개: `a.mp3` … `z.mp3` — **파닉스 소리(음소)**로 읽음 (글자 이름 아님).
  - 모음(a,e,i,o,u): 단모음 순수 음소 (a→/æ/, e→/ɛ/, i→/ɪ/, o→/ɑ/, u→/ʌ/)
  - 자음: 짧은 슈와(ə)를 붙임 (t→"트", f→"프", g→"그"). 자음 순수 음소는 TTS에서 거의 안 들려서(측정: /f/ -46dB) 유성 캐리어를 더한 것. `volume(%)`·`length(ː)`·`emphasis` 는 Azure가 무시하므로 슈와가 유일하게 효과적.
  - 소리를 바꾸려면 스크립트의 `PHONEMES` 맵(IPA)을 수정하세요.

> 단어를 추가·변경하면 `index.html` 의 `WORDS` 와 이 스크립트의 `WORDS` 를 함께 맞춰주세요.
