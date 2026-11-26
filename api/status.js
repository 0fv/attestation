const TARGET_URL = 'https://android.googleapis.com/attestation/status';

export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, If-Modified-Since',
};

const FORWARD_REQUEST_HEADERS = [
  'accept',
  'if-none-match',
  'if-modified-since',
];

const FORWARD_RESPONSE_HEADERS = [
  'content-type',
  'cache-control',
  'etag',
  'last-modified',
  'expires',
  'date',
];

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      {
        status: 405,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
          Allow: 'GET, HEAD, OPTIONS',
        },
      }
    );
  }

  const upstreamHeaders = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      upstreamHeaders.set(name, value);
    }
  }

  try {
    const upstreamResponse = await fetch(TARGET_URL, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(CORS_HEADERS);
    for (const name of FORWARD_RESPONSE_HEADERS) {
      const value = upstreamResponse.headers.get(name);
      if (value) {
        responseHeaders.set(name, value);
      }
    }

    if (!responseHeaders.has('content-type') && upstreamResponse.status !== 304) {
      responseHeaders.set('content-type', 'application/json; charset=utf-8');
    }

    return new Response(
      upstreamResponse.status === 304 || request.method === 'HEAD'
        ? null
        : upstreamResponse.body,
      {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'Failed to fetch upstream',
      }),
      {
        status: 502,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
