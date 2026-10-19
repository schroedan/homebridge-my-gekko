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
  params?: Record<string, unknown>;
  ttl?: number;
  retries?: number;
}): AxiosCacheInstance {
  const instance = axios.create({
    auth: config.auth,
    baseURL: config.baseURL,
    params: config.params,
    // do not let hanging requests be processed long after newer ones
    timeout: 10 * 1000,
  });

  const cachedInstance = setupCache(instance, {
    ttl: config.ttl,
  });

  // retries must be set up after the cache: otherwise a retry waits for the
  // cache entry of its own failed request, which never resolves, and all
  // further requests for the same url hang
  axiosRetry(cachedInstance, { retries: config.retries });

  return cachedInstance;
}
