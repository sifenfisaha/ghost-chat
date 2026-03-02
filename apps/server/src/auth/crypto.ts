import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

export function hashSecret(secret: string): string {
  const normalized = secret.trim();
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(normalized, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifySecret(secret: string, secretHash: string): boolean {
  const normalized = secret.trim();
  const [salt, storedHash] = secretHash.split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = scryptSync(normalized, salt, SCRYPT_KEY_LENGTH).toString(
    'hex'
  );

  return timingSafeEqual(
    Buffer.from(storedHash, 'hex'),
    Buffer.from(computedHash, 'hex')
  );
}
