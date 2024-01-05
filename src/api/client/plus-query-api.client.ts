import { QueryAPIClient, createInstance } from './query-api.client';

export type PlusQueryAPIConfig = Partial<{
  username: string;
  key: string;
  gekkoid: string;
  ttl: number;
}>;

export class PlusQueryAPIClient implements QueryAPIClient {
  readonly auth = {
    username: this.config.username,
    key: this.config.key,
    gekkoid: this.config.gekkoid,
  };

  readonly baseURL = 'https://live.my-gekko.com/api/v1';

  readonly instance = createInstance({
    baseURL: this.baseURL,
    params: this.auth,
    ttl: 1000 * (this.config.ttl || 3),
    retries: 3,
  });

  constructor(public readonly config: PlusQueryAPIConfig) {}
}
