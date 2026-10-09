import { AxiosCacheInstance } from 'axios-cache-interceptor';

import { QueryAPIClient, createInstance } from './query-api.client';

export type PlusQueryAPIConfig = Partial<{
  username: string;
  key: string;
  gekkoid: string;
  ttl: number;
  retries: number;
}>;

export class PlusQueryAPIClient implements QueryAPIClient {
  readonly auth: { username?: string; key?: string; gekkoid?: string };

  readonly baseURL = 'https://live.my-gekko.com/api/v1';

  readonly instance: AxiosCacheInstance;

  constructor(public readonly config: PlusQueryAPIConfig) {
    this.auth = {
      username: config.username,
      key: config.key,
      gekkoid: config.gekkoid,
    };

    this.instance = createInstance({
      baseURL: this.baseURL,
      params: this.auth,
      ttl: 1000 * (config.ttl || 3),
      retries: config.retries || 3,
    });
  }
}
