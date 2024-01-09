import { QueryAPIClient, createInstance } from './query-api.client';

export type LocalQueryAPIConfig = Partial<{
  host: string;
  username: string;
  password: string;
  ttl: number;
  retries: number;
}>;

export class LocalQueryAPIClient implements QueryAPIClient {
  readonly auth = {
    username: this.config.username || 'mygekko',
    password: this.config.password || 'mygekko',
  };

  readonly baseURL = `http://${this.config.host || 'mygekko'}/api/v1`;

  readonly instance = createInstance({
    auth: this.auth,
    baseURL: this.baseURL,
    ttl: 1000 * (this.config.ttl || 3),
    retries: this.config.retries || 3,
  });

  constructor(public readonly config: LocalQueryAPIConfig) {}
}
