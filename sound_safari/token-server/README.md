# 발음평가 토큰 서버 (Azure Speech)

음소별 정확 발음평가(Azure Pronunciation Assessment)를 쓰기 위해, **Azure 키를 클라이언트에 노출하지 않고** 단기 토큰만 발급하는 서버리스 함수입니다. (Cloudflare Workers 예시)

## 1. Azure Speech 리소스 만들기
1. [Azure Portal](https://portal.azure.com) → "Speech services" 리소스 생성 (무료 F0 티어 가능)
2. 생성 후 **키(KEY 1)** 와 **지역(Region, 예: `koreacentral`)** 확인

## 2. Cloudflare Worker 배포
```bash
npm i -g wrangler
wrangler login
cd token-server
wrangler deploy worker.js --name sound-safari-token
# 키/지역 등록
wrangler secret put AZURE_KEY        # ← Azure 키 붙여넣기 (시크릿, 노출 안 됨)
wrangler var put AZURE_REGION koreacentral   # 또는 대시보드에서 환경변수로 등록
```
배포되면 `https://sound-safari-token.<계정>.workers.dev` 같은 URL이 나옵니다.
> 동작 확인: 브라우저에서 그 URL을 열면 `{"token":"...","region":"koreacentral"}` 이 나와야 합니다.

## 3. 게임에 연결
`sound_safari.html` 상단 스크립트의 상수를 채웁니다:
```js
const AZURE_TOKEN_URL = 'https://sound-safari-token.<계정>.workers.dev';
```
- 비워두면 기존 **간이(Web Speech) 평가**로 자동 대체됩니다.
- 채우면 마이크 발음 시 **음소별 정확도 점수(0~100) + IPA**로 평가됩니다.

## 4. 보안 권장
- `worker.js`의 `Access-Control-Allow-Origin`을 `*` 대신 실제 배포 도메인(예: `https://jinilee-hue.github.io`)으로 제한하세요.
- 무료 티어 초과/남용 방지를 위해 필요시 Worker에 rate limit을 추가하세요.

## 대안
- **Azure Functions / Vercel / Netlify Functions** 로도 동일하게 만들 수 있습니다(같은 issueToken 호출). 원하는 플랫폼 알려주시면 그에 맞는 코드도 드리겠습니다.
