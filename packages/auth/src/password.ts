const HASH_ALGORITHM = "SHA-256";
const KEY_DERIVATION = "PBKDF2";
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const ITERATIONS = 310_000;
const FORMAT = "pbkdf2_sha256";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derivePasswordHash(password, salt, ITERATIONS);

  return [FORMAT, ITERATIONS.toString(), toHex(salt), toHex(hash)].join("$");
}

export async function verifyPassword(
  password: string,
  encodedHash: string
): Promise<boolean> {
  const [format, iterationsValue, saltHex, hashHex] = encodedHash.split("$");

  if (
    format !== FORMAT ||
    !iterationsValue ||
    !saltHex ||
    !hashHex ||
    !/^\d+$/u.test(iterationsValue)
  ) {
    return false;
  }

  const iterations = Number.parseInt(iterationsValue, 10);
  const salt = fromHex(saltHex);
  const expectedHash = fromHex(hashHex);

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = await derivePasswordHash(password, salt, iterations);
  return timingSafeEqual(actualHash, expectedHash);
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);
  const normalizedSalt = new Uint8Array(salt);
  const key = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    KEY_DERIVATION,
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      hash: HASH_ALGORITHM,
      iterations,
      name: KEY_DERIVATION,
      salt: normalizedSalt
    },
    key,
    HASH_BYTES * 8
  );

  return new Uint8Array(derivedBits);
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftByte = left[index];
    const rightByte = right[index];

    if (leftByte === undefined || rightByte === undefined) {
      return false;
    }

    difference |= leftByte ^ rightByte;
  }

  return difference === 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

function fromHex(value: string): Uint8Array | null {
  if (value.length % 2 !== 0 || /[^0-9a-f]/iu.test(value)) {
    return null;
  }

  const bytes = new Uint8Array(value.length / 2);

  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return bytes;
}
