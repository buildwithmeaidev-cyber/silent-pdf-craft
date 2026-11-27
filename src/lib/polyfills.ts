// Runtime compatibility shims for PDF processing engines (pdfjs-dist v6.5+)
// across Node test runners and browsers predating ES2025/ES2026 Stage 3 APIs:
// Promise.try, Promise.withResolvers, Uint8Array.toHex/fromHex/toBase64/fromBase64,
// Map.getOrInsert/getOrInsertComputed, and WeakMap.getOrInsert/getOrInsertComputed.

export function ensureRuntimePolyfills(): void {
  const P = Promise as unknown as {
    try?: unknown;
    withResolvers?: unknown;
  };

  if (typeof P.try !== "function") {
    Object.defineProperty(Promise, "try", {
      configurable: true,
      writable: true,
      value: function promiseTry<T, Args extends unknown[]>(
        this: PromiseConstructor,
        fn: (...args: Args) => T | PromiseLike<T>,
        ...args: Args
      ): Promise<T> {
        return new (this || Promise)<T>((resolve) => {
          resolve(fn(...args));
        });
      },
    });
  }

  if (typeof P.withResolvers !== "function") {
    Object.defineProperty(Promise, "withResolvers", {
      configurable: true,
      writable: true,
      value: function withResolvers<T>() {
        let resolve!: (value: T | PromiseLike<T>) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<T>((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      },
    });
  }

  const u8Proto = Uint8Array.prototype as unknown as {
    toHex?: () => string;
    toBase64?: () => string;
  };

  if (typeof u8Proto.toHex !== "function") {
    Object.defineProperty(Uint8Array.prototype, "toHex", {
      configurable: true,
      writable: true,
      value: function toHex(this: Uint8Array): string {
        let hex = "";
        for (let i = 0; i < this.length; i++) {
          hex += this[i].toString(16).padStart(2, "0");
        }
        return hex;
      },
    });
  }

  if (typeof (Uint8Array as unknown as { fromHex?: unknown }).fromHex !== "function") {
    Object.defineProperty(Uint8Array, "fromHex", {
      configurable: true,
      writable: true,
      value: function fromHex(str: string): Uint8Array {
        if (typeof str !== "string" || str.length % 2 !== 0 || /[^0-9a-fA-F]/.test(str)) {
          throw new SyntaxError("Invalid hex string");
        }
        const out = new Uint8Array(str.length / 2);
        for (let i = 0; i < out.length; i++) {
          out[i] = parseInt(str.slice(i * 2, i * 2 + 2), 16);
        }
        return out;
      },
    });
  }

  if (typeof u8Proto.toBase64 !== "function") {
    Object.defineProperty(Uint8Array.prototype, "toBase64", {
      configurable: true,
      writable: true,
      value: function toBase64(this: Uint8Array, options?: { alphabet?: string; omitPadding?: boolean }): string {
        let bin = "";
        const CHUNK = 0x8000;
        for (let i = 0; i < this.length; i += CHUNK) {
          bin += String.fromCharCode(...this.subarray(i, i + CHUNK));
        }
        let b64 = btoa(bin);
        if (options?.alphabet === "base64url") {
          b64 = b64.replace(/\+/g, "-").replace(/\//g, "_");
        }
        if (options?.omitPadding) {
          b64 = b64.replace(/=+$/, "");
        }
        return b64;
      },
    });
  }

  if (typeof (Uint8Array as unknown as { fromBase64?: unknown }).fromBase64 !== "function") {
    Object.defineProperty(Uint8Array, "fromBase64", {
      configurable: true,
      writable: true,
      value: function fromBase64(str: string): Uint8Array {
        const clean = str.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
        const bin = atob(clean);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          out[i] = bin.charCodeAt(i);
        }
        return out;
      },
    });
  }

  const mapProto = Map.prototype as unknown as {
    getOrInsert?: <K, V>(this: Map<K, V>, key: K, defaultValue: V) => V;
    getOrInsertComputed?: <K, V>(this: Map<K, V>, key: K, callback: (key: K) => V) => V;
  };

  if (typeof mapProto.getOrInsert !== "function") {
    Object.defineProperty(Map.prototype, "getOrInsert", {
      configurable: true,
      writable: true,
      value: function getOrInsert<K, V>(this: Map<K, V>, key: K, defaultValue: V): V {
        if (this.has(key)) return this.get(key) as V;
        this.set(key, defaultValue);
        return defaultValue;
      },
    });
  }

  if (typeof mapProto.getOrInsertComputed !== "function") {
    Object.defineProperty(Map.prototype, "getOrInsertComputed", {
      configurable: true,
      writable: true,
      value: function getOrInsertComputed<K, V>(this: Map<K, V>, key: K, callback: (key: K) => V): V {
        if (this.has(key)) return this.get(key) as V;
        const val = callback(key);
        this.set(key, val);
        return val;
      },
    });
  }

  const wmProto = WeakMap.prototype as unknown as {
    getOrInsert?: <K extends object, V>(this: WeakMap<K, V>, key: K, defaultValue: V) => V;
    getOrInsertComputed?: <K extends object, V>(this: WeakMap<K, V>, key: K, callback: (key: K) => V) => V;
  };

  if (typeof wmProto.getOrInsert !== "function") {
    Object.defineProperty(WeakMap.prototype, "getOrInsert", {
      configurable: true,
      writable: true,
      value: function getOrInsert<K extends object, V>(this: WeakMap<K, V>, key: K, defaultValue: V): V {
        if (this.has(key)) return this.get(key) as V;
        this.set(key, defaultValue);
        return defaultValue;
      },
    });
  }

  if (typeof wmProto.getOrInsertComputed !== "function") {
    Object.defineProperty(WeakMap.prototype, "getOrInsertComputed", {
      configurable: true,
      writable: true,
      value: function getOrInsertComputed<K extends object, V>(this: WeakMap<K, V>, key: K, callback: (key: K) => V): V {
        if (this.has(key)) return this.get(key) as V;
        const val = callback(key);
        this.set(key, val);
        return val;
      },
    });
  }
}

ensureRuntimePolyfills();
