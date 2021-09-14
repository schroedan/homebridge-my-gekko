import { MemoryCache } from './memory-cache';

describe('Memory cache', () => {
  it('should provide standard TTL option', () => {
    const cache = new MemoryCache({ ttl: 30 });

    expect(cache.options.stdTTL).toBe(30);
  });
});
