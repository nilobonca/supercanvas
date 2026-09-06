/**
 * Polyfill for crypto.randomUUID
 * Ensures randomUUID is available in insecure contexts, older runtimes,
 * WebViews, and extensions.
 */

function generateUUID(): string {
  const targetCrypto =
    typeof globalThis !== 'undefined' && globalThis.crypto
      ? globalThis.crypto
      : typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : null;

  if (targetCrypto && typeof targetCrypto.getRandomValues === 'function') {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
      (c ^ (targetCrypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 1. Prototype patching if Crypto class exists
if (typeof Crypto !== 'undefined' && Crypto.prototype && typeof (Crypto.prototype as any).randomUUID !== 'function') {
  try {
    Object.defineProperty(Crypto.prototype, 'randomUUID', {
      value: generateUUID,
      writable: true,
      configurable: true,
    });
  } catch {}
}

// 2. Patch globalThis.crypto
if (typeof globalThis !== 'undefined') {
  const g = globalThis as any;
  if (!g.crypto) {
    try {
      g.crypto = {};
    } catch {}
  }
  if (g.crypto && typeof g.crypto.randomUUID !== 'function') {
    try {
      g.crypto.randomUUID = generateUUID;
    } catch {
      try {
        Object.defineProperty(g.crypto, 'randomUUID', {
          value: generateUUID,
          writable: true,
          configurable: true,
        });
      } catch {}
    }
  }
}

// 3. Patch window.crypto
if (typeof window !== 'undefined') {
  const w = window as any;
  if (!w.crypto) {
    try {
      w.crypto = {};
    } catch {}
  }
  if (w.crypto && typeof w.crypto.randomUUID !== 'function') {
    try {
      w.crypto.randomUUID = generateUUID;
    } catch {
      try {
        Object.defineProperty(w.crypto, 'randomUUID', {
          value: generateUUID,
          writable: true,
          configurable: true,
        });
      } catch {}
    }
  }
}

export {};
