import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Minimal HMAC-signed token (`payload.signature`, both base64url). Uses only
 * Node's built-in `crypto` — consistent with the password hashing in
 * user.service.ts, which deliberately avoids external dependencies.
 */

export interface TokenPayload {
  /** User id. */
  sub: number;
  userName: string;
  /** Expiry as unix seconds. */
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(
    input.replace(/-/g, '+').replace(/_/g, '/') + pad,
    'base64',
  );
}

export function signToken(payload: TokenPayload, secret: string): string {
  const body = base64url(JSON.stringify(payload));
  const signature = base64url(
    createHmac('sha256', secret).update(body).digest(),
  );
  return `${body}.${signature}`;
}

/** Returns the payload if the signature is valid and not expired, else null. */
export function verifyToken(
  token: string,
  secret: string,
): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const expected = base64url(
    createHmac('sha256', secret).update(body).digest(),
  );
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64url(body).toString('utf8'),
    ) as TokenPayload;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
