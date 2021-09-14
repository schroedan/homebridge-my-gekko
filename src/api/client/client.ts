import { Cache } from './cache';
import { Connection } from './connection';
import { cached, uncached } from './query';
import { ReadRequest, Request, WriteRequest } from './request';
import { Response } from './response';

export class Client {
  private _cache?: Cache;

  constructor(readonly connection: Connection) {}

  useCache(cache?: Cache): void {
    this._cache = cache;
  }

  readRequest(): ReadRequest {
    return new ReadRequest(this.connection);
  }

  writeRequest(): WriteRequest {
    return new WriteRequest(this.connection);
  }

  async query(request: Request): Promise<Response> {
    if (request instanceof ReadRequest && this._cache !== undefined) {
      return cached(request, this._cache);
    }
    return uncached(request);
  }
}
