import axios, { AxiosBasicCredentials } from 'axios';
import { AxiosCacheInstance, setupCache } from 'axios-cache-interceptor';
import axiosRetry from 'axios-retry';

export interface QueryAPIClient {
  readonly auth:
    | {
        username: string;
        password: string;
      }
    | {
        username?: string;
        key?: string;
        gekkoid?: string;
      };
  readonly baseURL: string;
  readonly instance: AxiosCacheInstance;
}

export function createInstance(config: {
  auth?: AxiosBasicCredentials;
  baseURL?: string;
  params?: any;
  ttl?: number;
  retries?: number;
}): AxiosCacheInstance {
  const instance = setupCache(
    axios.create({
      auth: config.auth,
      baseURL: config.baseURL,
      params: config.params,
    }),
    {
      ttl: config.ttl,
    },
  );

  axiosRetry(instance, { retries: config.retries });

  return instance;
}
