import { createHmac } from 'node:crypto';

const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 30;

export type SessionTokenPayload = {
  userId: string;
  username: string;
  iat: number;
  exp: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || 'dev-only-session-secret';
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signValue(value: string) {
  return createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('base64url');
}

export function createSessionToken(payload: {
  userId: string;
  username: string;
}) {
  const issuedAt = Math.floor(Date.now() / 1000);

  const tokenPayload: SessionTokenPayload = {
    userId: payload.userId,
    username: payload.username,
    iat: issuedAt,
    exp: issuedAt + SESSION_EXPIRY_SECONDS,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  const [encodedPayload, signature] = token.trim().split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decodedPayload = decodeBase64Url(encodedPayload);
    const payload = JSON.parse(decodedPayload) as SessionTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.userId || !payload.username || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
