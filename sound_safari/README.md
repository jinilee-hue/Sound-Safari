# Sound Safari 🦁

아이들이 자주 틀리는 영어 파닉스 발음을 연습하는 정글 테마 단어 게임입니다.

## 플레이 방법
1. 그림을 보고 아래 글자 카드를 **순서대로 드래그**해 단어를 완성합니다.
2. 단어를 완성하면 마지막 글자 발음 → 전체 단어를 읽어줍니다.
3. **마이크 버튼**을 눌러 직접 발음하면 발음 평가 팝업(별점·점수)이 뜨고 보너스 점수를 받습니다.
4. 발음까지 해야 **Next** 버튼이 나타나 다음 단어로 넘어갑니다.
5. 한 판에 3문제가 전체 단어 풀에서 랜덤으로 출제됩니다.

## 단어 & 타깃 소리
cat, bat, fan(f↔p), van(v↔b), rat(r↔l), log(l↔r), bus(b↔v), pig(p↔f),
fox(f↔p), sun, cup(단모음), bed(b↔v)

## 실행
`sound_safari.html`을 브라우저에서 엽니다.
- 마이크(음성 인식)는 **Chrome/Edge** + `https://` 또는 `localhost`에서 동작합니다.
- 로컬 서버 예: `python -m http.server 8000` → `http://localhost:8000/sound_safari.html`

## 구성
- `sound_safari.html` — 게임 본체 (HTML/CSS/JS)
- `assets/` — 게임에 사용되는 이미지 (Figma에서 export)
- `Images/` — 원본 소스 이미지

## 크레딧
- 디자인/아트: Figma "Sound Safari"
- 음성: Web Speech API (SpeechSynthesis / SpeechRecognition)
