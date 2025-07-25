/**
 * Cache factory that returns the appropriate cache implementation based on runtime environment
 */

import { CacheInterface, CacheOptions } from "./interface.js";
import { CloudflareCache } from "./cloudflare-cache.js";
import { FileSystemCache } from "./filesystem-cache.js";
import { MemoryCache } from "./memory-cache.js";
import { isCloudflareWorker } from "../env.js";

/**
 * Create a cache instance based on the runtime environment
 */
export function createCache(options?: CacheOptions): CacheInterface {
  // Check for Cloudflare Workers environment
  if (typeof caches !== "undefined" && (globalThis as any).caches?.default) {
    return new CloudflareCache(options);
  }

  // Check for Node.js environment
  if (
    typeof process !== "undefined" &&
    process.versions?.node &&
    !isCloudflareWorker
  ) {
    return new FileSystemCache(options);
  }

  // Browser or unknown environment - use in-memory cache
  return new MemoryCache(options);
}

/**
 * Create a cache with explicit type
 */
export function createCacheOfType(
  type: "cloudflare" | "filesystem" | "memory",
  options?: CacheOptions
): CacheInterface {
  switch (type) {
    case "cloudflare": {
      return new CloudflareCache(options);
    }
    case "filesystem": {
      return new FileSystemCache(options);
    }
    case "memory": {
      return new MemoryCache(options);
    }
    default: {
      throw new Error(`Unknown cache type: ${type}`);
    }
  }
}
