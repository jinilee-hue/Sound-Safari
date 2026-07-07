// Cloudflare Worker — Azure Speech 단기 토큰 발급 (키를 클라이언트에 노출하지 않기 위함)
// 배포: wrangler deploy  /  시크릿: AZURE_KEY, 변수: AZURE_REGION
export default {
  async fetch(request, env) {
    // 배포 시 '*' 대신 실제 도메인으로 제한 권장 (예: https://jinilee-hue.github.io)
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const region = env.AZURE_REGION; // 예: koreacentral, eastus
    const key = env.AZURE_KEY;       // Azure Speech 리소스 키 (시크릿)
    if (!region || !key) {
      return new Response(JSON.stringify({ error: 'Missing AZURE_KEY / AZURE_REGION' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const r = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' },
    });
    if (!r.ok) {
      return new Response(JSON.stringify({ error: 'token issue failed', status: r.status }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const token = await r.text();
    // 토큰은 약 10분 유효
    return new Response(JSON.stringify({ token, region }), {
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  },
};
