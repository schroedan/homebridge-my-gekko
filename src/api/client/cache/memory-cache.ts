import NodeCache from 'node-cache';
import { Cache } from './cache';

export class MemoryCache extends NodeCache implements Cache {
  constructor(options: { ttl: number }) {
    super({ stdTTL: options.ttl });
  }
}
