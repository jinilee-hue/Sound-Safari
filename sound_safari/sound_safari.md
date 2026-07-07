# Sound Safari 🦁 — 서비스 전체 개요

> 5~7세 아동을 위한 영어 파닉스(소리·발음) 학습 웹 게임

**작성자**: 이진희 | **팀**: AI Product팀

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | **Sound Safari** |
| 장르 | 영어 파닉스 단어 완성 + 발음 연습 게임 |
| 대상 | 5~7세 한국 아동 |
| 플랫폼 | 웹 브라우저 (PC · 태블릿) |
| 접속 방법 | URL 직접 접속, 설치 불필요 |
| 언어 | 영어 콘텐츠 + 한국어 UI |
| 테마 | 정글/사파리 (사자 마스코트) |

---

## 2. 핵심 학습 목표

아이들이 자주 헷갈리는 **파닉스 소리(자음/모음)** 를 두 방향으로 익힌다.

1. **글자 조합**: 그림을 보고 글자 카드를 순서대로 끼워 단어(CVC)를 완성 → 글자–소리 대응 체득
2. **발음 연습**: 완성한 단어를 직접 마이크로 발음 → **음소별 정확도 평가**로 발음 교정

- **혼동 소리 훈련**: f↔p, v↔b, r↔l 등 한국 아동이 자주 틀리는 소리를 오답 보기(distractor)로 배치
- **성공 기준**: 아이가 혼자 그림→단어 완성→발음까지 수행

---

## 3. 게임 플로우

```
인트로 (로고 + 시작 버튼)
    ↓ 화면 터치
게임 화면 — 한 판 = 3문제 (12개 단어 풀에서 랜덤)
    ↓ 문제별
① 글자 3개를 순서대로 드래그해 단어 완성
    ↓ 완성
② GOOD! + 마이크 활성화("발음해봐!")
    ↓ 마이크로 발음
③ 발음 평가 팝업 (별점·음소별 점수·보너스)
    ↓ Next
다음 문제 → 3문제 끝나면 새 라운드(랜덤 3개)
```

### 3-1. 인트로

- `logo.png` + `btn_start.png`(펄스 애니메이션) 표시
- 화면 터치 시 게임 시작 + **사용자 제스처로 배경음악(음소거 해제) 재생**

### 3-2. 라운드 진행

- 한 판 **3문제**(`ROUND=3`), 12개 단어 풀에서 무작위 셔플 후 3개 선택
- 3문제를 모두 끝내면 자동으로 새 라운드(다시 랜덤 3개)

---

## 4. 게임 콘텐츠 (단어 풀 12종 · CVC)

각 단어는 정답 글자 3개 + **혼동 소리 오답(distractor) 2개** = 트레이 5장으로 출제된다.

| 단어 | 그림 | 타깃/혼동 소리 |
|------|------|----------------|
| cat | 🐱 | 기본 |
| bat | 🦇 | f · p |
| fan | 🪭 | **f ↔ p** |
| van | 🚐 | **v ↔ b** |
| rat | 🐀 | **r ↔ l** |
| log | 🪵 | **l ↔ r** |
| bus | 🚌 | **b ↔ v** |
| pig | 🐷 | **p ↔ f** |
| fox | 🦊 | **f ↔ p** |
| sun | ☀️ | s |
| cup | 🥤 | 단모음 u ↔ a |
| bed | 🛏️ | b ↔ v / 단모음 e |

- 그림: `assets/img_<word>.png`
- 글자 카드: `assets/alphabet_<a-z>.png` (+ `alphabet_blank.png`), 슬롯/트레이에서 크기만 축소해 공용 사용

---

## 5. 화면 구성 (1280×720 스테이지, contain 스케일)

```
┌──────────────────────────────────────────────────────────────┐
│ [🏠Home][⚙️Setting]        [❤️❤️❤️ 진행]        [Score 보드]  │  ← 상단
│                                                              │
│   [사자 마스코트]     "단어를 완성하고 발음해봐!"  (안내문)     │
│                     ┌──────── board ────────┐                │
│                     │  [그림]                 │  [🔁Replay]    │
│                     │  [_][_][_]  ← 글자 슬롯   │  [🎤Mic]      │
│                     └────────────────────────┘  [🔊Speak]     │
│                                                              │
│         [ㄱ][ㄴ][ㄷ][ㄹ][ㅁ]  ← 글자 트레이(5장)   [Next ▶]    │
└──────────────────────────────────────────────────────────────┘
```

### 상단 요소

| 요소 | 역할 |
|------|------|
| 🏠 Home | 인트로 화면으로 복귀 |
| ⚙️ Setting | 설정 팝업(배경음악/말소리 토글) |
| ❤️ 진행 하트 × 3 | 이번 라운드에서 **푼 문제만** 하트로 채워짐 |
| Score 보드 | 점수(시작 180) |

### 우측 버튼

| 버튼 | 기능 |
|------|------|
| 🔁 Replay | 현재 문제를 풀의 다른 단어로 랜덤 교체 + 초기화 |
| 🎤 Mic | 발음 연습 → 평가 팝업 (단어 완성 전엔 잠김 `locked`, 완성 후 `invite` 초대 애니메이션) |
| 🔊 Speak | 현재 단어 듣기(TTS) — 재생 중 초록, 끝나면 주황 |

### 글자 드래그 동작

- **드래그(Pointer 이벤트)**: 트레이 글자를 슬롯으로 끌어다 놓기 (`touch-action:none`, `setPointerCapture`)
- 슬롯 위로 오면 `hot`(노란 글로우) 하이라이트
- **순서 검증**: 각 슬롯에 기대 글자(`dataset.exp`)와 일치해야 배치(`placeCorrect`), 아니면 원위치(`wrong` + Try Again!)
- 배치 성공: `tilePop` 팝 애니메이션 + 글자 소리(TTS)
- 스테이지 스케일(`SX/SY`)을 반영해 좌표 계산 → 어떤 화면 크기에서도 정확히 드롭

---

## 6. 발음 평가 시스템

### 6-1. 두 가지 엔진 (자동 선택)

1. **Azure Pronunciation Assessment** (우선) — 음소(Phoneme)별 정확도 점수. 토큰 서버 URL이 설정돼 있고 SDK 로드 시 사용.
2. **Web Speech API** (fallback) — 브라우저 음성 인식으로 단어 인식 후, **편집 거리(Levenshtein) 정렬**로 글자별 근사 평가.
3. 음성 인식 미지원 브라우저 → 안내(`info_txt6`) 후 발음 없이 Next 허용.

### 6-2. 평가 팝업 (evalModal)

- **별점**
  - Azure: overall ≥80 → ★★★ / ≥60 → ★★ / ≥40 → ★
  - Web Speech: 맞은 소리 개수(최대 3) = 별 개수
- **음소/글자별 표시**
  - Azure: `/음소/` + 점수, 색상 초록(≥70)·주황(≥40)·빨강(<40)
  - Web Speech: 글자별 `o`(맞음)/`x`(틀림)
- **틀린 소리 안내**: 틀린 음소를 IPA 발음기호로 표기 (예: `/f/ /æ/`)
- **다시 하기 / 닫기** 버튼

### 6-3. 녹음 UX

- 녹음 중엔 **배경음악·TTS 정지**(마이크 간섭 방지 → 인식률↑), 종료 후 복구
- 마이크가 실제로 켜진 뒤(`onaudiostart` / `sessionStarted`)에야 "발음해보세요" 안내 표시 (타이밍 오류 방지)
- Azure 8초 무음 타임아웃 설정

---

## 7. 점수 정책

| 행동 | 점수 |
|------|------|
| 시작 점수 | 180 |
| 단어 완성 | **+20** |
| 발음 보너스(레벨당 1회) | ★★★ +30 / ★★ +20 / ★ +10 |

---

## 8. 사자 마스코트 (Lion)

상태별 이미지·위치·크기 + 애니메이션으로 아이와 상호작용.

| 상태 | 이미지 | 상황 | 애니메이션 |
|------|--------|------|-----------|
| idle | lion1 | 기본(보드 가리킴) | bob(살랑) |
| listen | lion3 | 마이크 녹음 중 | pop |
| celebrate | lion2 | 단어 완성 | jump(점프 환호) |
| praise | lion4 | 발음 잘함(50점↑) | pop |

- 대기 시 살랑(`lionBob`), 상태 전환 시 pop/jump
- **클릭 인터랙션**: 사자를 누르면 현재 단어를 읽어줌 + 통통 튐

---

## 9. 음성·오디오

| 항목 | 내용 |
|------|------|
| 배경음악 | `assets/game_bg.mp4` 영상의 오디오 트랙 (없으면 `bg.png` 정지 배경) |
| 단어/글자 읽기 | 브라우저 **SpeechSynthesis(TTS)**, en-US, rate 0.8 |
| 자동 안내 | 문제 로드 후 **2초간 조작이 없으면** 단어를 읽어줌 |
| 단어 완성 시 | 마지막 글자 발음 → 250ms 후 전체 단어 읽기 |
| 안내 토스트 | `info_txt1~6.png` 이미지 (발음 안내·마이크 오류·미지원 등) |
| 결과 | `good.png` / `try_again.png` + 컨페티 |
| 설정 | 배경음악 / 말소리(TTS) 각각 ON/OFF 토글 |

---

## 10. 기술 스택

| 항목 | 선택 |
|------|------|
| 구현 | **단일 HTML 파일**(`sound_safari.html`) + Vanilla JS (프레임워크 없음) |
| 레이아웃 | 1280×720 고정 스테이지 → `transform: scale()` contain 방식 (찌그러짐 없이 전체 표시) |
| 발음평가 | **Azure Speech SDK**(음소별) + **Web Speech API**(fallback) |
| 토큰 발급 | **Cloudflare Worker** (Azure 단기 토큰, 키 서버측 보관) |
| 폰트 | Fredoka · Jua · Comic Relief (Google Fonts) |
| 저장소 | 상태는 메모리(라운드 단위), 영속 저장 없음 |
| 배포 | **GitHub Pages** (`jinilee-hue/Sound-Safari`) |

### 파일 구조

```
sound_safari.html        — 게임 전체 (HTML+CSS+JS 단일 파일)
assets/                  — Figma에서 export한 아트 (81개: 배경/보드/버튼/사자/글자·그림 카드/안내 이미지 등)
  ├─ game_bg.mp4, bg.png, logo.png, board.png, word_board.png
  ├─ lion1~4.png (상태별), life_board/heart, point_board, pop_box
  ├─ btn_*.png (home/setting/replay/mic/mic_on/speak/speak_off/next/close/start)
  ├─ alphabet_<a-z>.png + alphabet_blank.png (글자 카드)
  ├─ img_<word>.png (단어 그림), ic_star(_blank), good/try_again, info_txt1~6
token-server/            — Cloudflare Worker (Azure 토큰 발급)
  ├─ worker.js, README.md
README.md                — 플레이 방법 요약
```

> ⚠️ 루트 `Images/` 폴더(레거시)는 게임이 참조하지 않습니다 — 실제 사용 경로는 `assets/` 뿐입니다.

### 화면 스케일

```javascript
const s = Math.min(app.clientWidth/1280, app.clientHeight/720); // contain
stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
```

---

## 11. Azure 토큰 서버 (token-server)

발음평가용 Azure Speech **단기 토큰(~10분)** 을 발급하는 Cloudflare Worker. **Azure 키를 클라이언트에 노출하지 않기 위함**.

- **엔드포인트**: `GET` → `{ token, region }` 반환
- **시크릿/변수**: `AZURE_KEY`(시크릿), `AZURE_REGION`(예: koreacentral, eastus)
- **배포**: `wrangler deploy`
- **연결**: `sound_safari.html`의 `AZURE_TOKEN_URL` 상수에 Worker URL 지정 (비우면 Web Speech 간이 평가로 동작)
- CORS: 배포 시 `*` 대신 실제 도메인으로 제한 권장

> 🔐 보안: Azure 리소스 키는 Worker 시크릿에만 저장하며 코드/클라이언트에 포함하지 않는다.

---

## 12. 배포

- **저장소**: GitHub (`jinilee-hue/Sound-Safari`) — 저장소 루트에 `sound_safari.html` + `assets/`
- **배포 방식**: GitHub Pages (main 브랜치 → "pages build and deployment" 자동 발행)
- **라이브 URL**: `https://jinilee-hue.github.io/Sound-Safari/sound_safari.html`
- **로컬 실행**: `python -m http.server 8000` → `http://localhost:8000/sound_safari.html`
  - 마이크(음성 인식)는 **Chrome/Edge** + `https://` 또는 `localhost`에서만 동작

### 배포 주의

- 이미지 파일명이 동일하면(예: `alphabet_i.png`) 브라우저/CDN 캐시로 옛 이미지가 보일 수 있음 → `Ctrl+F5` 강력 새로고침
- "Deploy to GitHub Pages" 단계가 간헐적으로 `try again later`로 실패할 수 있음 → 빈 커밋 push로 재발행

---

## 13. 구현 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| 글자 드래그 단어 완성 | ✅ | 순서 검증, hot 하이라이트, 팝 애니메이션 |
| TTS 단어/글자 읽기 | ✅ | SpeechSynthesis, 2초 무반응 자동 안내 |
| Azure 음소별 발음평가 | ✅ | 토큰 서버 연동, 음소 점수·별점·틀린 소리 표기 |
| Web Speech 간이 평가 | ✅ | Azure 미설정/미지원 시 fallback |
| 점수·보너스 | ✅ | 완성 +20, 발음 별점 보너스 |
| 설정(배경음악/말소리) | ✅ | 팝업 토글 + 닫기 |
| 사자 마스코트 상태·인터랙션 | ✅ | idle/listen/celebrate/praise + 클릭 시 단어 읽기 |
| 진행 하트 | ✅ | 라운드 내 푼 문제 표시 |
| 단어 풀 확장 | 🔲 | 현재 12개 CVC. 추가·난이도 스테이지 미구현 |
| 사용자 계정/진도 저장 | 🔲 | 영속 저장 없음(라운드 단위) |
| 발음 히스토리/리포트 | 🔲 | 회차별 결과 누적·통계 미구현 |

---

*최종 업데이트: 2026-07-06*
