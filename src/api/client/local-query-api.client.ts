import { AxiosCacheInstance } from 'axios-cache-interceptor';

import { QueryAPIClient, createInstance } from './query-api.client';

export type LocalQueryAPIConfig = Partial<{
  host: string;
  username: string;
  password: string;
  ttl: number;
  retries: number;
}>;

export class LocalQueryAPIClient implements QueryAPIClient {
  readonly auth: { username: string; password: string };

  readonly baseURL: string;

  readonly instance: AxiosCacheInstance;

  constructor(public readonly config: LocalQueryAPIConfig) {
    this.auth = {
      username: config.username || 'mygekko',
      password: config.password || 'mygekko',
    };

    this.baseURL = `http://${config.host || 'mygekko'}/api/v1`;

    this.instance = createInstance({
      auth: this.auth,
      baseURL: this.baseURL,
      ttl: 1000 * (config.ttl || 3),
      retries: config.retries || 3,
    });
  }
}
